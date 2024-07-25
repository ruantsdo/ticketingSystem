//React
import { useEffect, useState } from "react";
//Stores
import useFileStore from "../../stores/videosStore/videos";
//Components
import VideoCard from "./components/videos/videoCard";

function Settings() {
  const { getFullVideosList } = useFileStore();

  const [videosList, setVideosList] = useState();

  const handleVideosList = async () => {
    const response = await getFullVideosList();
    setVideosList(response);
  };

  useEffect(() => {
    handleVideosList();
    //eslint-disable-next-line
  }, []);

  return (
    <div>
      <p>Config Page</p>
      {videosList && (
        <>
          {videosList.map((item) => (
            <VideoCard videoName={item} key={item.id || item} /> // Added key prop for better performance
          ))}
        </>
      )}
    </div>
  );
}

export default Settings;
