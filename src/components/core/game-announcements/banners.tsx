import { useShallow } from "zustand/react/shallow";
import useApplicationStore from "../../state/application-state";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const sliderVariants = {
  incoming: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    scale: 1.2,
    opacity: 0,
  }),
  active: { x: 0, scale: 1, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    scale: 1,
    opacity: 0.2,
  }),
};

const sliderTransition = {
  duration: 1,
  ease: [0.56, 0.03, 0.12, 1.04],
};

export default function ScrollingBanners() {
  const { images } = useApplicationStore(
    useShallow((state) => ({
      images: state.images.banners,
    }))
  );

  const [currentImage, setCurrentImage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const swipeToImage = (swipeDirection: number) => {
    setCurrentImage(currentImage + swipeDirection);
    setDirection(swipeDirection);

    if (currentImage + swipeDirection >= images.length) {
      setCurrentImage(0);
    } else if (currentImage + swipeDirection < 0) {
      setCurrentImage(images.length - 1);
    }
  };

  const skipToImage = (imageId: number) => {
    let changeDirection = 0;
    if (imageId > activeImageIndex) {
      changeDirection = 1;
    } else if (imageId < activeImageIndex) {
      changeDirection = -1;
    }
    setCurrentImage(imageId + changeDirection);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(currentImage + 1 >= images.length ? 0 : currentImage + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentImage]);

  return (
    <div className="absolute bottom-10 left-10 w-[400px] overflow-hidden">
      <div className="relative rounded-xl overflow-hidden bg-bg-color h-[185.5px]">
        <AnimatePresence initial={false}>
          <motion.img
            key={`announcements-banner-img${currentImage}`}
            custom={direction}
            variants={sliderVariants}
            initial="incoming"
            animate="active"
            exit="exit"
            src={images[currentImage].img}
            transition={sliderTransition}
            className="absolute overflow-hidden rounded-lg w-[400px] h-[185.5px] bg-cover bg-center bg-no-repeat will-change-transform"
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
