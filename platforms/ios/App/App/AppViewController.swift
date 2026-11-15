import Capacitor
import WebKit

class AppViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(PmsvPrintPlugin())
        if ProcessInfo.processInfo.arguments.contains("-pmsv-ui-testing") {
            let script = WKUserScript(source: "window.__PMSV_TEST_OFFLINE__=true;", injectionTime: .atDocumentStart, forMainFrameOnly: true)
            webView?.configuration.userContentController.addUserScript(script)
        }
    }
}
