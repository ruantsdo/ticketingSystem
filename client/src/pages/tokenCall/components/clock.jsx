//React
import { useState, useEffect } from "react";

//Icons
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";

const Clock = () => {
  const [date, setDate] = useState(new Date());
  const [hour, setHour] = useState(new Date());

  useEffect(() => {
    const updateDate = () => {
      setDate(new Date());
    };

    const updateHour = () => {
      setHour(new Date());
    };

    const intervalDateId = setInterval(updateDate, 60000);
    const intervalHourId = setInterval(updateHour, 30000);

    return () => {
      clearInterval(intervalDateId);
      clearInterval(intervalHourId);
    };
  }, []);

  return (
    <div className="flex flex-row justify-around items-center w-full h-[20%] border-1 border-divider dark:darkDivider rounded-lg text-4xl">
      <p className="flex flex-row items-center gap-2">
        <CalendarMonthOutlinedIcon fontSize="large" />
        {date.toLocaleDateString()}
      </p>
      <p className="flex flex-row items-center gap-2">
        <AccessTimeOutlinedIcon fontSize="large" />
        {hour.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
    </div>
  );
};

export default Clock;
