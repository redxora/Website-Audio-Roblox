import SmoothScroll from "@/components/SmoothScroll";
import AeroShardsBackground from "@/components/AeroShardsBackground";
import NotificationCenter from "@/components/ui/NotificationCenter";
import "./design.css";
import "./app.css";
import "./cursors.css";
export const metadata = {
    title: "CILAAA COMMUNITY — Audio Pipeline for Roblox",
    description: "Convert audio from files or links, prepare Roblox-ready WAV, and publish straight to your Roblox account via Open Cloud.",
    icons: { icon: "/asset/image/logo/logo.png" },
    robots: { index: true, follow: true },
};
export const viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#080808",
};
export default function RootLayout({ children, }) {
    return (<html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
            __html: `(function(){
              if(typeof window==='undefined')return;
              // Suppress external browser extension crashes from showing in Next.js Turbopack overlay
              window.addEventListener('error', function(e){
                if (e.filename && e.filename.indexOf('chrome-extension://') !== -1) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  return true;
                }
                var msg = (e.message || '') + ' ' + ((e.error && e.error.stack) || '');
                if (msg.indexOf('chrome-extension://') !== -1 || msg.indexOf('M_ID') !== -1) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                  return true;
                }
              }, true);
              window.addEventListener('unhandledrejection', function(e){
                var reason = e.reason && (e.reason.stack || e.reason.message || '');
                if (typeof reason === 'string' && (reason.indexOf('chrome-extension://') !== -1 || reason.indexOf('M_ID') !== -1)) {
                  e.stopImmediatePropagation();
                  e.preventDefault();
                }
              }, true);
              try{
                var o=new MutationObserver(function(muts){
                  for(var i=0;i<muts.length;i++){
                    if(muts[i].attributeName==='bis_skin_checked'&&muts[i].target&&muts[i].target.removeAttribute){
                      muts[i].target.removeAttribute('bis_skin_checked');
                    }
                  }
                });
                o.observe(document.documentElement,{attributes:true,subtree:true,attributeFilter:['bis_skin_checked']});
              }catch(e){}
            })();`,
        }}/>
      </head>
      <body suppressHydrationWarning>
        <AeroShardsBackground />
        <SmoothScroll />
        <div className="relative z-10 w-full min-h-screen">
          {children}
        </div>
        <NotificationCenter />
      </body>
    </html>);
}
