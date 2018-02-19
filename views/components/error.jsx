const React = require('react');

class ErrorMessage extends React.Component {

  render() {
    if (!this.props.message) {
      return null;
    }
    return (
      <div className="error-summary">
        <ul className="error-summary-list">
          <li>{this.props.message}</li>
        </ul>
      </div>
    );
  }

}

module.exports = ErrorMessage;
