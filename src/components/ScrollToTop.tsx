import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop component automatically and instantaneously scrolls the window
 * to the very top (0, 0) whenever the user navigates between pages/routes.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Temporarily set scrollBehavior to 'auto' to prevent jarring slow scroll animations
    const prevScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" as ScrollBehavior,
    });

    document.documentElement.scrollTop = 0;
    if (document.body) {
      document.body.scrollTop = 0;
    }

    const timer = setTimeout(() => {
      document.documentElement.style.scrollBehavior = prevScrollBehavior;
    }, 60);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
