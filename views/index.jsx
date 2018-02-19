const React = require('react');
const Layout = require('./layout');

class Index extends React.Component {
  render() {
    return (
      <Layout {...this.props}>
        <h1>ASL Migrator</h1>
        <div id="upload" />
      </Layout>
    );
  }
}

module.exports = Index;