// src/components/Loading.jsx
import Lottie from "lottie-react";
import loadingAnimation from '../../assets/anim/Loading1.json';
import './Loading.css'

const Loading = ({ message }) => {
    return (
        <div className="loader">
            <div id="load">
                <Lottie
                    animationData={loadingAnimation}
                    loop={true}
                    style={{ height: 200, width: 200 }}
                    className="load-animation"
                />
                <p>{message || 'cargando'} </p>
            </div>
        </div>
    );
};

export default Loading;
