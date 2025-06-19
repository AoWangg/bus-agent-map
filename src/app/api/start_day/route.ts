export const runtime = "edge";

const workerUrl = "https://bus.orville.wang";

export async function POST(request: Request) {
  // 读取前端传来的参数
  const body = await request.json();

  // 转发到 Cloudflare Worker
  const res = await fetch(workerUrl + "/start_day", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // 直接返回 Worker 的响应
  const data = await res.text();
  return new Response(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
