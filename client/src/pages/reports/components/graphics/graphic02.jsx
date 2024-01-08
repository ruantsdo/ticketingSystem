import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Graph02 = ({ graphData }) => (
  <ResponsiveContainer width="30%" height="100%">
    <BarChart
      width={500}
      height={300}
      data={graphData}
      margin={{
        top: 5,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="Nome" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar
        dataKey="Quantidade"
        fill="#8884d8"
        activeBar={<Rectangle fill="pink" stroke="blue" />}
      />
    </BarChart>
  </ResponsiveContainer>
);

export default Graph02;
