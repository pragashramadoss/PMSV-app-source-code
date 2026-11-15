import Capacitor
import UIKit
import WebKit

@objc(PmsvPrintPlugin)
public class PmsvPrintPlugin: CAPPlugin, CAPBridgedPlugin, WKNavigationDelegate {
    public let identifier = "PmsvPrintPlugin"
    public let jsName = "PmsvPrint"
    public let pluginMethods: [CAPPluginMethod] = [CAPPluginMethod(name: "printReport", returnType: CAPPluginReturnPromise)]
    private var reportView: WKWebView?
    private var pending: CAPPluginCall?

    @objc func printReport(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard self.pending == nil else { call.reject("A print request is already open."); return }
            self.pending = call
            if let html = call.getString("html"), !html.isEmpty {
                guard html.utf8.count < 4 * 1024 * 1024 else { self.pending = nil; call.reject("Report is too large."); return }
                let config = WKWebViewConfiguration()
                config.defaultWebpagePreferences.allowsContentJavaScript = false
                let report = WKWebView(frame: CGRect(x: 0, y: 0, width: 794, height: 1123), configuration: config)
                report.navigationDelegate = self
                self.reportView = report
                report.loadHTMLString(html, baseURL: nil)
            } else if let view = self.bridge?.webView { self.presentPrint(view) }
            else { self.pending = nil; call.reject("The report is unavailable.") }
        }
    }
    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { presentPrint(webView) }
    public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        pending?.reject("The report could not be prepared."); pending = nil; reportView = nil
    }
    private func presentPrint(_ view: WKWebView) {
        let controller = UIPrintInteractionController.shared
        let info = UIPrintInfo(dictionary: nil)
        info.jobName = "PMSV audit report"; info.outputType = .general
        controller.printInfo = info; controller.printFormatter = view.viewPrintFormatter()
        controller.present(animated: true) { _, completed, error in
            if let error = error { self.pending?.reject(error.localizedDescription) }
            else { self.pending?.resolve(["completed": completed]) }
            self.pending = nil; self.reportView = nil
        }
    }
}
