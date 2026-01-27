import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

// Este componente permite que el scroll vaya al inicio al cambiar de vista,
// de lo contrario permanecería en la posición de la vista anterior.
// Investiga más sobre este comportamiento de React :D

const ScrollToTop = ({ location, children }) => {
    const prevLocation = useRef(location);

    useEffect(() => {
        if (location !== prevLocation.current) {
            window.scrollTo(0, 0);
        }
        prevLocation.current = location;
    }, [location]);

    return children;
};

export default ScrollToTop;

ScrollToTop.propTypes = {
    location: PropTypes.object,
    children: PropTypes.any
};