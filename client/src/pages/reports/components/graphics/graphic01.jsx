//Recharts
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const Graph01 = ({ graphData }) => (
  <ResponsiveContainer width="100%" height={300} className="text-textColor">
    <BarChart
      data={graphData}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="2 2" />
      <XAxis dataKey="name" stroke="black" />
      <YAxis stroke="black" />
      <Tooltip />
      <Legend />
      <Bar dataKey="Quantidade" stackId="a" fill="#ffc658" maxBarSize={100} />
      <Bar
        dataKey="Disponibilidade"
        stackId="a"
        fill="#82ca9d"
        maxBarSize={100}
      />
      <Bar dataKey="Atendidos" stackId="b" fill="#2C931F" maxBarSize={100} />
      <Bar dataKey="Aguardando" stackId="b" fill="#008EDB" maxBarSize={100} />
      <Bar dataKey="Adiados" stackId="b" fill="#FF6254" maxBarSize={100} />
      <Bar
        dataKey="Em atendimento"
        stackId="b"
        fill="#A946A0"
        maxBarSize={100}
      />
    </BarChart>
  </ResponsiveContainer>
);

export default Graph01;
