import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode };
type State = { failed: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="app-runtime-fallback"><h1>This screen could not load.</h1><button type="button" onClick={() => { this.setState({ failed: false }); window.location.hash = '#/'; }}>Return home</button></main>;
  }
}
