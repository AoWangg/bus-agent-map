"use client";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function BusSimulation() {
  // 地图中心坐标（上海）
  const mapCenter: [number, number] = [31.2304, 121.4737];

  return (
    <div>
      <h1>公交仿真页面</h1>
      <div className="main-container">
        {/* 左侧地图 */}
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
            </MapContainer>
          </div>
        </div>
        {/* 右侧信息框 */}
        <div className="right-column">
          <div className="activity-display">
            <h2>公交仿真右侧框</h2>
            <div>开发中...</div>
          </div>
        </div>
      </div>
    </div>
  );
}
