// import React from "react";
// import videojs from "video.js";
// import "video.js/dist/video-js.css";

// export const VideoJS = (props) => {
//   const videoRef = React.useRef(null);
//   const playerRef = React.useRef(null);
//   const { options, onReady } = props;

//   React.useEffect(() => {
//     // Make sure Video.js player is only initialized once
//     if (!playerRef.current) {
//       // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
//       const videoElement = document.createElement("video-js");

//       videoElement.classList.add("vjs-big-play-centered");
//       videoRef.current.appendChild(videoElement);

//       const player = (playerRef.current = videojs(videoElement, options, () => {
//         videojs.log("player is ready");
//         onReady && onReady(player);
//       }));

//       // You could update an existing player in the `else` block here
//       // on prop change, for example:
//     } else {
//       const player = playerRef.current;

//       player.autoplay(options.autoplay);
//       player.src(options.sources);
//     }
//   }, [options, videoRef]);

//   // Dispose the Video.js player when the functional component unmounts
//   React.useEffect(() => {
//     const player = playerRef.current;

//     return () => {
//       if (player && !player.isDisposed()) {
//         player.dispose();
//         playerRef.current = null;
//       }
//     };
//   }, [playerRef]);

//   return (
//     <div data-vjs-player>
//       <div ref={videoRef} />
//     </div>
//   );
// };

// export default VideoJS;

import React, { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css"; // Importe o CSS do Video.js

function VideoJS() {
  const videoPlayerRef = useRef(null);

  useEffect(() => {
    if (videoPlayerRef.current) {
      // Inicialize o player de vídeo com a opção de fonte personalizada (DTI)
      const player = videojs(videoPlayerRef.current, {
        techOrder: ["html5"],
        sources: [
          {
            src: "https://alagoinhas.com.br/tv/tvindoor/dti/",
            type: "video/mp4",
          },
        ],
      });

      return () => {
        if (player) {
          player.dispose(); // Limpe o player de vídeo quando o componente for desmontado
        }
      };
    }
  }, []);

  return (
    <div>
      {/* Use o ref para criar o elemento de vídeo no DOM */}
      <video
        ref={videoPlayerRef}
        className="video-js vjs-default-skin"
        controls
      />
    </div>
  );
}

export default VideoJS;
