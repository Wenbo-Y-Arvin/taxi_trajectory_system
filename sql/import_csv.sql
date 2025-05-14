-- 1. （可选）切换到目标数据库，然后启用 PostGIS 扩展（用于后续空间分析）
--    PostGIS 提供了对地理对象和空间索引的支持
CREATE EXTENSION IF NOT EXISTS postgis;                          -- :contentReference[oaicite:0]{index=0}

-- 2. 创建原始表，用于接收 CSV 数据
CREATE TABLE taxi_trip_raw (
    trip_id       BIGINT        PRIMARY KEY,
    call_type     CHAR(1),
    origin_call   INTEGER,
    origin_stand  INTEGER,
    taxi_id       INTEGER,
    ts            BIGINT,       -- 原始 UNIX 时间戳
    day_type      CHAR(1),
    missing_data  BOOLEAN,
    polyline      TEXT          -- 原始 polyline 字符串
);