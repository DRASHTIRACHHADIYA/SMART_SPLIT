import Lottie from "lottie-react";
import animationData from "../assets/Analytics Character Animation.json";

function LoginLeft() {
  return (
    <div className="login-left">
      <div className="login-left-content">
        <h1>SmartSplit</h1>
        <p>Split expenses smartly, not stressfully.</p>

        <div className="lottie-box">
          <Lottie
            animationData={animationData}
            loop={true}
          />
        </div>
      </div>
    </div>
  );
}

export default LoginLeft;
