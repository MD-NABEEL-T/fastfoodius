## GitHub Copilot Chat

- Extension: 0.42.3 (prod)
- VS Code: 1.113.0 (cfbea10c5ffb233ea9177d34726e6056e89913dc)
- OS: win32 10.0.19045 x64
- GitHub Account: MD-NABEEL-T

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.207.73.85 (674 ms)
- DNS ipv6 Lookup: Error (5 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (24 ms)
- Electron fetch (configured): Error (125 ms): Error: net::ERR_CERT_DATE_INVALID
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (526 ms): Error: certificate has expired
	at TLSSocket.onConnectSecure (node:_tls_wrap:1697:34)
	at TLSSocket.emit (node:events:519:28)
	at TLSSocket._finishInit (node:_tls_wrap:1095:8)
	at ssl.onhandshakedone (node:_tls_wrap:881:12)
- Node.js fetch: Error (608 ms): TypeError: fetch failed
	at node:internal/deps/undici/undici:14902:13
	at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
	at async t._fetch (c:\Users\Fazil\.vscode\extensions\github.copilot-chat-0.42.3\dist\extension.js:5171:5228)
	at async t.fetch (c:\Users\Fazil\.vscode\extensions\github.copilot-chat-0.42.3\dist\extension.js:5171:4540)
	at async u (c:\Users\Fazil\.vscode\extensions\github.copilot-chat-0.42.3\dist\extension.js:5203:186)
	at async cg._executeContributedCommand (file:///c:/Users/Fazil/AppData/Local/Programs/Microsoft%20VS%20Code/cfbea10c5f/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:501:48675)
  Error: certificate has expired
  	at TLSSocket.onConnectSecure (node:_tls_wrap:1697:34)
  	at TLSSocket.emit (node:events:519:28)
  	at TLSSocket._finishInit (node:_tls_wrap:1095:8)
  	at ssl.onhandshakedone (node:_tls_wrap:881:12)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.114.22 (358 ms)
- DNS ipv6 Lookup: Error (556 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (25 ms)
- Electron fetch (configured): Error (773 ms): Error: net::ERR_CERT_DATE_INVALID
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (800 ms): Error: certificate has expired
	at TLSSocket.onConnectSecure (node:_tls_wrap:1697:34)
	at TLSSocket.emit (node:events:519:28)
	at TLSSocket._finishInit (node:_tls_wrap:1095:8)
	at ssl.onhandshakedone (node:_tls_wrap:881:12)
- Node.js fetch: Error (1036 ms): TypeError: fetch failed
	at node:internal/deps/undici/undici:14902:13
	at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
	at async t._fetch (c:\Users\Fazil\.vscode\extensions\github.copilot-chat-0.42.3\dist\extension.js:5171:5228)
	at async t.fetch (c:\Users\Fazil\.vscode\extensions\github.copilot-chat-0.42.3\dist\extension.js:5171:4540)
	at async u (c:\Users\Fazil\.vscode\extensions\github.copilot-chat-0.42.3\dist\extension.js:5203:186)
	at async cg._executeContributedCommand (file:///c:/Users/Fazil/AppData/Local/Programs/Microsoft%20VS%20Code/cfbea10c5f/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:501:48675)
  Error: certificate has expired
  	at TLSSocket.onConnectSecure (node:_tls_wrap:1697:34)
  	at TLSSocket.emit (node:events:519:28)
  	at TLSSocket._finishInit (node:_tls_wrap:1095:8)
  	at ssl.onhandshakedone (node:_tls_wrap:881:12)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: 4.225.11.192 (149 ms)
- DNS ipv6 Lookup: Error (69 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (29 ms)
- Electron fetch (configured): Error (1181 ms): Error: net::ERR_CERT_DATE_INVALID
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
- Node.js https: Error (772 ms): Error: certificate has expired
	at TLSSocket.onConnectSecure (node:_tls_wrap:1697:34)
	at TLSSocket.emit (node:events:519:28)
	at TLSSocket._finishInit (node:_tls_wrap:1095:8)
	at ssl.onhandshakedone (node:_tls_wrap:881:12)
- Node.js fetch: Error (704 ms): TypeError: fetch failed
	at node:internal/deps/undici/undici:14902:13
	at process.processTicksAndRejections (node:internal/process/task_queues:103:5)
	at async t._fetch (c:\Users\Fazil\.vscode\extensions\github.copilot-chat-0.42.3\dist\extension.js:5171:5228)
	at async t.fetch (c:\Users\Fazil\.vscode\extensions\github.copilot-chat-0.42.3\dist\extension.js:5171:4540)
	at async u (c:\Users\Fazil\.vscode\extensions\github.copilot-chat-0.42.3\dist\extension.js:5203:186)
	at async cg._executeContributedCommand (file:///c:/Users/Fazil/AppData/Local/Programs/Microsoft%20VS%20Code/cfbea10c5f/resources/app/out/vs/workbench/api/node/extensionHostProcess.js:501:48675)
  Error: certificate has expired
  	at TLSSocket.onConnectSecure (node:_tls_wrap:1697:34)
  	at TLSSocket.emit (node:events:519:28)
  	at TLSSocket._finishInit (node:_tls_wrap:1095:8)
  	at ssl.onhandshakedone (node:_tls_wrap:881:12)

Connecting to https://mobile.events.data.microsoft.com: Error (993 ms): Error: net::ERR_CERT_DATE_INVALID
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
Connecting to https://dc.services.visualstudio.com: Error (1398 ms): Error: net::ERR_CERT_DATE_INVALID
	at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10684)
	at SimpleURLLoaderWrapper.emit (node:events:519:28)
  {"is_request_error":true,"network_process_crashed":false}
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: Error (781 ms): Error: certificate has expired
	at TLSSocket.onConnectSecure (node:_tls_wrap:1697:34)
	at TLSSocket.emit (node:events:519:28)
	at TLSSocket._finishInit (node:_tls_wrap:1095:8)
	at ssl.onhandshakedone (node:_tls_wrap:881:12)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: Error (1041 ms): Error: certificate has expired
	at TLSSocket.onConnectSecure (node:_tls_wrap:1697:34)
	at TLSSocket.emit (node:events:519:28)
	at TLSSocket._finishInit (node:_tls_wrap:1095:8)
	at ssl.onhandshakedone (node:_tls_wrap:881:12)
Connecting to https://default.exp-tas.com: Error (686 ms): Error: certificate has expired
	at TLSSocket.onConnectSecure (node:_tls_wrap:1697:34)
	at TLSSocket.emit (node:events:519:28)
	at TLSSocket._finishInit (node:_tls_wrap:1095:8)
	at ssl.onhandshakedone (node:_tls_wrap:881:12)

Number of system certificates: 63

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).