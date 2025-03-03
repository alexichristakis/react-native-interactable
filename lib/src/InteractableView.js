import React, { Component } from "react";
import ReactNative, {
  requireNativeComponent,
  Animated,
  NativeModules,
  UIManager,
  Platform
} from "react-native";

const NATIVE_COMPONENT_NAME = "InteractableView";

// this is required in order to perform imperative commands
const NativeViewManager = NativeModules.InteractableViewManager;

const NativeInteractableView = requireNativeComponent(NATIVE_COMPONENT_NAME, null);

class WrappedInteractableView extends Component {
  render() {
    return <NativeInteractableView {...this.props} ref={ref => (this._nativeViewRef = ref)} />;
  }

  getScrollableNode() {
    return ReactNative.findNodeHandle(this._nativeViewRef);
  }
}

// this is required in order to support native events:
const AnimatedInteractableView = Animated.createAnimatedComponent(WrappedInteractableView);

class WrappedAnimatedInteractableView extends Component {
  constructor(props) {
    super(props);
    if (this.props.animatedValueX || this.props.animatedValueY) {
      this._animatedEvent = Animated.event(
        [
          {
            nativeEvent: {
              x: this.props.animatedValueX,
              y: this.props.animatedValueY
            }
          }
        ],
        { useNativeDriver: !!this.props.animatedNativeDriver }
      );
    }
  }

  // // this helps us verify that useNativeDriver actually works and we don't rely on the bridge
  // chokeTheBridge() {
  //   let j = 0;
  //   setInterval(() => {
  //     for (var index = 0; index < 1e9; index++) {
  //       j++;
  //     }
  //   }, 500);
  // }

  render() {
    return (
      <AnimatedInteractableView
        dragToss={0.1}
        {...this.props}
        animatedValueX={undefined}
        animatedValueY={undefined}
        onAnimatedEvent={this._animatedEvent}
        reportOnAnimatedEvents={!!this._animatedEvent}
      />
    );
  }

  setVelocity(params) {
    if (Platform.OS === "ios") {
      NativeViewManager.setVelocity(ReactNative.findNodeHandle(this), params);
    } else if (Platform.OS === "android") {
      UIManager.dispatchViewManagerCommand(
        ReactNative.findNodeHandle(this),
        UIManager.getViewManagerConfig(NATIVE_COMPONENT_NAME).Commands.setVelocity[params]
      );
    }
  }

  snapTo(params) {
    if (Platform.OS === "ios") {
      NativeViewManager.snapTo(ReactNative.findNodeHandle(this), params);
    } else if (Platform.OS === "android") {
      UIManager.dispatchViewManagerCommand(
        ReactNative.findNodeHandle(this),
        UIManager.getViewManagerConfig(NATIVE_COMPONENT_NAME).Commands.snapTo,
        [params]
      );
    }
  }

  changePosition(params) {
    if (Platform.OS === "ios") {
      NativeViewManager.changePosition(ReactNative.findNodeHandle(this), params);
    } else if (Platform.OS === "android") {
      UIManager.dispatchViewManagerCommand(
        ReactNative.findNodeHandle(this),
        UIManager.getViewManagerConfig(NATIVE_COMPONENT_NAME).Commands.changePosition,
        [params]
      );
    }
  }

  bringToFront() {
    if (Platform.OS === "android") {
      UIManager.dispatchViewManagerCommand(
        ReactNative.findNodeHandle(this),
        UIManager.getViewManagerConfig(NATIVE_COMPONENT_NAME).Commands.bringToFront,
        []
      );
    }
  }
}

export default WrappedAnimatedInteractableView;
