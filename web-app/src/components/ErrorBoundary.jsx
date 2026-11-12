import React from "react";

/* Catches render errors below it so one broken page cannot blank the whole app.
   `fallback(error, reset)` draws the replacement; changing `resetKey` (a new page, new
   code) clears the error automatically. */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
    this.reset = () => this.setState({ error: null });
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    this.props.onError?.(error);
  }

  componentDidUpdate(prev) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.reset();
  }

  render() {
    if (this.state.error) return this.props.fallback(this.state.error, this.reset);
    return this.props.children;
  }
}
