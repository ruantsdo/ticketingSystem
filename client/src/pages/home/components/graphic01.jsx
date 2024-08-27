import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from "recharts";

const COLORS = ["#4cb250", "#008edb", "#a946a0", "#ff6254"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Graph01 = ({ graphData }) => (
  <ResponsiveContainer width="100%" minHeight={300} height="100%">
    <PieChart width={400} height={400}>
      <Pie
        data={graphData}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={renderCustomizedLabel}
        outerRadius={80}
        fill="#8884d8"
        dataKey="Quantidade"
      >
        {graphData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index]} />
        ))}
      </Pie>
      <Legend
        payload={graphData.map((entry, index) => ({
          id: entry.Nome,
          type: "square",
          value: entry.Nome,
          color: COLORS[index],
        }))}
      />
    </PieChart>
  </ResponsiveContainer>
);

export default Graph01;
