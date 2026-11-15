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
                    const image=document.querySelector('.family-brand img,.platform-brand img');
                    if(image){
                        clearInterval(ready);
                        image.decode().then(()=>image.closest('a')?.setAttribute('aria-label','PMSV logo ready'))
                            .catch(()=>image.closest('a')?.setAttribute('aria-label','PMSV logo failed'));
                    }
                    else if(++attempts>100)clearInterval(ready);
                },100);
            },{once:true});
            """, injectionTime: .atDocumentStart, forMainFrameOnly: true)
            webView?.configuration.userContentController.addUserScript(script)
        }
    }
}
