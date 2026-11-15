import Capacitor
import WebKit

class AppViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(PmsvPrintPlugin())
        if ProcessInfo.processInfo.arguments.contains("-pmsv-ui-testing") {
            let script = WKUserScript(source: """
            window.__PMSV_TEST_OFFLINE__=true;
            document.addEventListener('DOMContentLoaded',()=>{
                let attempts=0;
                const ready=setInterval(()=>{
                    const image=document.querySelector('.family-brand img');
                    if(image){clearInterval(ready);image.decode().then(()=>image.alt='PMSV family logo loaded').catch(()=>image.alt='PMSV family logo failed');}
                    else if(++attempts>100)clearInterval(ready);
                },100);
            },{once:true});
            """, injectionTime: .atDocumentStart, forMainFrameOnly: true)
            webView?.configuration.userContentController.addUserScript(script)
        }
    }
}
