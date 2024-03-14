import React from "react";

export default class ErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
  },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <img src="/qiqi_fallen.png" alt="Error" />
          <h2>Something went wrong.</h2>
          <p>Check the console for more details.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
