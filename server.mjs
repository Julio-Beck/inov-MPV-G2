import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'dist'),mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.woff2':'font/woff2'};
const port=Number(process.env.PORT)||4173;
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}const body=await readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(body);}catch{res.writeHead(404);res.end('Página não encontrada');}});
server.on('error',e=>{console.error(e.code==='EADDRINUSE'?`A porta ${port} já está em uso. Feche a outra janela do servidor ou rode com outra porta (ex.: PORT=4174).`:e.message);process.exit(1);});
server.listen(port,'0.0.0.0',()=>console.log(`Oportuniza Rede: http://localhost:${port}  (Ctrl+C para parar)`));
