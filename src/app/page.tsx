"use client";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// agent 相关类型
type Activity = {
  activityType: keyof typeof activityIcons;
  locationType: string;
  startTime: string;
  endTime: string;
  lat: number;
  lng: number;
};
type Agent = {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  activities: Activity[];
};

// 颜色与图标
const agentColors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#FF33A8",
  "#FF8F33",
  "#33FFF8",
  "#FF3333",
  "#8B33FF",
  "#FF8E33",
  "#33FF83",
];
const activityIcons = {
  education: "📚",
  "leisure activities": "🎉",
  sleep: "🛏️",
  work: "💼",
  shopping: "🛒",
} as const;

function formatTime(minutes: number) {
  const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mins = String(minutes % 60).padStart(2, "0");
  return `${hours}:${mins}`;
}
function timeToMinutes(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

export default function Home() {
  // 状态
  const [time, setTime] = useState(0); // 分钟
  const [numAgents, setNumAgents] = useState(10);
  const [startTime, setStartTime] = useState("00:00");
  const [agents, setAgents] = useState<Record<string, Agent>>({});
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [agentVisibility, setAgentVisibility] = useState<{
    [id: string]: boolean;
  }>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 地图中心
  const mapCenter: [number, number] = [31.2304, 121.4737];

  // 初始化地图和定时器
  useEffect(() => {
    if (isAutoRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev + 15 >= 1440) {
            setIsAutoRunning(false);
            return 1440;
          }
          return prev + 15;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isAutoRunning]);

  // 滑块/时间变化时更新活动
  useEffect(() => {
    // 可在此处请求后端或模拟 agent 活动
  }, [time]);

  // 启动一天
  function startDay() {
    if (!/^([0-1]\d|2[0-3]):([0-5]\d)$/.test(startTime)) {
      alert("请输入有效的24小时制时间 (如 08:00)");
      return;
    }
    if (isNaN(numAgents) || numAgents < 1) {
      alert("请输入有效的 agent 数量");
      return;
    }
    setTime(timeToMinutes(startTime));
    setIsAutoRunning(true);
    // 这里模拟 agent 数据，实际应 fetch('/start_day')
    const fakeAgents: Record<string, Agent> = {};
    for (let i = 0; i < numAgents; i++) {
      fakeAgents[i] = {
        name: `Agent${i + 1}`,
        age: 20 + (i % 30),
        gender: i % 2 === 0 ? "Male" : "Female",
        occupation: ["Engineer", "Teacher", "Student", "Doctor"][i % 4],
        activities: [
          {
            activityType: "work",
            locationType: "Office",
            startTime: "09:00",
            endTime: "17:00",
            lat: 31.23 + i * 0.01,
            lng: 121.47 + i * 0.01,
          },
          {
            activityType: "leisure activities",
            locationType: "Park",
            startTime: "17:00",
            endTime: "20:00",
            lat: 31.22 + i * 0.01,
            lng: 121.46 + i * 0.01,
          },
          {
            activityType: "sleep",
            locationType: "Home",
            startTime: "22:00",
            endTime: "08:00",
            lat: 31.21 + i * 0.01,
            lng: 121.45 + i * 0.01,
          },
        ],
      };
    }
    setAgents(fakeAgents);
    setAgentVisibility(
      Object.fromEntries(Object.keys(fakeAgents).map((id) => [id, true]))
    );
  }

  // 切换 agent 显示
  function toggleAgentVisibility(agentId: string) {
    setAgentVisibility((v) => ({ ...v, [agentId]: !v[agentId] }));
  }

  // 滑块手动调整
  function sliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTime(Number(e.target.value));
    setIsAutoRunning(false);
  }

  // 渲染 agent 按钮
  function renderAgentButtons() {
    return (
      <div className="agent-buttons">
        {Object.keys(agents).map((id, idx) => (
          <button
            key={id}
            className={
              agentVisibility[id] ? "agent-button-on" : "agent-button-off"
            }
            style={{
              backgroundColor: agentVisibility[id]
                ? agentColors[idx % agentColors.length]
                : undefined,
            }}
            onClick={() => toggleAgentVisibility(id)}
          >
            {agents[id].name} (Age: {agents[id].age})
          </button>
        ))}
      </div>
    );
  }

  // 渲染 agent 活动
  function renderAgentActivities() {
    return Object.keys(agents).map((id, idx) => {
      const agent = agents[id];
      const current = agent.activities.find((a) => {
        const s = timeToMinutes(a.startTime);
        const e = timeToMinutes(a.endTime);
        if (e < s) return time >= s || time < e; // 跨夜
        return time >= s && time < e;
      });
      if (!current) return null;
      return (
        <div
          className="agent-activity"
          key={id}
          style={{ borderLeftColor: agentColors[idx % agentColors.length] }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 5,
              color: agentColors[idx % agentColors.length],
            }}
          >
            {agent.name} (Age: {agent.age})
          </div>
          <div>
            Gender: <strong>{agent.gender}</strong>
          </div>
          <div>
            Occupation: <strong>{agent.occupation}</strong>
          </div>
          <div>
            Activity:{" "}
            <strong>
              {activityIcons[current.activityType] ?? "🏷️"}{" "}
              {current.activityType}
            </strong>
          </div>
          <div>
            Location: <strong>{current.locationType}</strong>
          </div>
          <div>
            Time:{" "}
            <strong>
              {current.startTime} - {current.endTime}
            </strong>
          </div>
        </div>
      );
    });
  }

  // 渲染地图上的 agent
  function renderMapAgents() {
    return Object.keys(agents).map((id, idx) => {
      if (!agentVisibility[id]) return null;
      const agent = agents[id];
      // 取当前活动
      const current = agent.activities.find((a) => {
        const s = timeToMinutes(a.startTime);
        const e = timeToMinutes(a.endTime);
        if (e < s) return time >= s || time < e; // 跨夜
        return time >= s && time < e;
      });
      if (!current) return null;
      // 轨迹点
      const points = agent.activities
        .filter((a) => timeToMinutes(a.startTime) <= time)
        .map((a) => [a.lat, a.lng] as [number, number]);
      return (
        <>
          {points.length > 1 && (
            <Polyline
              key={id + "poly"}
              positions={points}
              color={agentColors[idx % agentColors.length]}
              weight={3}
            />
          )}
          <Marker
            key={id + "marker"}
            position={
              [Number(current.lat), Number(current.lng)] as [number, number]
            }
          >
            <Tooltip permanent direction="right">
              {agent.name}
            </Tooltip>
          </Marker>
        </>
      );
    });
  }

  return (
    <div>
      <h1>上海市公交线路调整模拟系统</h1>
      <div className="clock-container">
        <span>
          <span id="clock">{formatTime(time)}</span>
        </span>
      </div>
      <div className="slider-container">
        <label htmlFor="timeSlider">模拟时间:</label>
        <input
          type="range"
          id="timeSlider"
          min={0}
          max={1440}
          step={15}
          value={time}
          onChange={sliderChange}
        />
        <span id="sliderTime">{formatTime(time)}</span>
      </div>
      <div className="main-container">
        {/* 左侧 */}
        <div className="left-column">
          <div id="map">
            <MapContainer
              center={mapCenter}
              zoom={11}
              style={{ height: 500, width: "100%", borderRadius: 10 }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://webrd04.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}"
                subdomains={["1", "2", "3", "4"]}
                maxZoom={18}
              />
              {renderMapAgents()}
            </MapContainer>
          </div>
          <div className="controls">
            <label htmlFor="startTime">开始时间:</label>
            <input
              type="text"
              id="startTime"
              placeholder="00:00"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <label htmlFor="numAgents">Agent数量:</label>
            <input
              type="number"
              id="numAgents"
              min={1}
              max={50}
              value={numAgents}
              onChange={(e) => setNumAgents(Number(e.target.value))}
            />
            <button onClick={startDay}>开始模拟</button>
          </div>
          {renderAgentButtons()}
        </div>
        {/* 右侧 */}
        <div className="right-column">
          <div className="activity-display">
            <h2>实时活动更新</h2>
            <div id="agent-activities">{renderAgentActivities()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
