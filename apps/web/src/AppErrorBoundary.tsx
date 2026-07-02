import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { error: Error | null };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Morning Changes route crash', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <main className="app-runtime-fallback" data-runtime-error={this.state.error.message}><h1>This screen could not load.</h1><button type="button" onClick={() => { this.setState({ error: null }); window.location.hash = '#/'; }}>Return home</button></main>;
  }
}
