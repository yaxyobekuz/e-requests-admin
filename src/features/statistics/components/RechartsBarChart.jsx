import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const ChartSkeleton = ({ height = 240 }) => (
  <div className="bg-white rounded-xl border p-5 animate-pulse">
    <div className="h-5 bg-gray-200 rounded w-40 mb-4" />
    <div className="bg-gray-100 rounded" style={{ height }} />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border rounded-lg shadow-md px-3 py-2 text-sm">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.fill || p.color }}>
            {p.name || "Soni"}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/**
 * Reusable bar chart component.
 * @param {Object} props
 * @param {Array} props.data - Array of data objects
 * @param {string} props.title - Chart title
 * @param {string} props.color - Bar fill color (default blue)
 * @param {"vertical"|"horizontal"} props.orientation - Chart orientation
 * @param {string} props.nameKey - Key for the name axis (default "name")
 * @param {string} props.valueKey - Key for the value axis (default "count")
 * @param {boolean} props.isLoading - Show skeleton if loading
 * @param {number} props.height - Chart height in px
 */
const RechartsBarChart = ({
  data = [],
  title,
  color = "#3B82F6",
  orientation = "vertical",
  nameKey = "name",
  valueKey = "count",
  isLoading = false,
  height,
}) => {
  if (isLoading) return <ChartSkeleton height={height || 240} />;

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">{title}</h3>
        <div
          className="flex items-center justify-center text-gray-400 text-sm"
          style={{ height: height || 200 }}
        >
          Ma'lumot mavjud emas
        </div>
      </div>
    );
  }

  if (orientation === "horizontal") {
    const chartHeight = height || Math.max(220, data.length * 40);
    return (
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold mb-4">{title}</h3>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F3F4F6"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#6B7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey={nameKey}
              tick={{ fontSize: 11, fill: "#374151" }}
              width={130}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey={valueKey}
              fill={color}
              radius={[0, 4, 4, 0]}
              maxBarSize={22}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={color}
                  fillOpacity={0.8 + (index / data.length) * 0.2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Vertical (default)
  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height || 240}>
        <BarChart data={data} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis
            dataKey={nameKey}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={valueKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RechartsBarChart;
