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

  const skipToImage = (imageId: number) => {
    setCurrentImage(imageId + 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage(currentImage + 1 >= images.length ? 0 : currentImage + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [currentImage]);

  return (
    <div>
      <a
        className="relative rounded-xl overflow-hidden bg-bg-color h-[185.5px]"
        href={images[currentImage].img_url}
        target="_blank"
      >
        <AnimatePresence initial={false}>
          <motion.img
            key={`announcements-banner-img${currentImage}`}
            custom={0}
            variants={sliderVariants}
            initial="incoming"
            animate="active"
            exit="exit"
            src={images[currentImage].img}
            transition={sliderTransition}
            className="absolute overflow-hidden rounded-lg w-[400px] h-[185.5px] bg-cover bg-center bg-no-repeat will-change-transform cursor-pointer"
          />
        </AnimatePresence>
      </a>
      <div className="absoute rounded-lg border-input-hover border-2 border-solid -translate-y-[50%] mx-auto flex gap-4 z-50 bg-button-dark w-fit py-2 px-4">
        {images.map((_, i) => {
          return (
            <motion.div
              className="rounded-full bg-white size-2"
              animate={{
                scale: currentImage == i ? 1.3 : 0.8,
              }}
              onClick={() => {
                skipToImage(i - 1);
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                stagger: 50,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
