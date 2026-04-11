export default defineEventHandler((event) => {
  const origin = event.node.req.headers.origin || "*";
  event.node.res.setHeader("Access-Control-Allow-Origin", origin);
  event.node.res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  event.node.res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  event.node.res.setHeader("Access-Control-Allow-Credentials", "true");

  if (event.node.req.method === "OPTIONS") {
    event.node.res.statusCode = 204;
    event.node.res.end();
  }
});