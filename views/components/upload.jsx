const React = require('react');

const ErrorMessage = require('./error');
const Log = require('./log');
const Progress = require('./progress');

class Upload extends React.Component {

  componentWillMount() {
    this.reset();
    this.events = new EventSource('/logs');
    this.events.onerror = e => {
      this.log(e.message, 'error');
    }
  }

  componentWillUnmount() {
    this.events.close();
  }

  reset() {
    this.setState({active: false, error: null, logs: [], progress: {} });
  }

  dragover(e) {
    e.preventDefault();
    this.setState({ active: true })
  }

  dragend(e) {
    this.setState({ active: false })
  }

  drop(e) {
    e.preventDefault();
    this.reset();
    const files = [].slice.call(e.dataTransfer.files);

    if (files.length === 0) {
      return;
    }

    Promise.all(files.map(file => {
      return new Promise((resolve, reject) => {
        if (file.type !== 'text/csv') {
          reject(new Error(`Invalid file type: ${file.type}`));
        }
        const reader = new FileReader();
        reader.addEventListener('loadend', (e) => {
          resolve({
            name: file.name,
            data: e.target.result
          });
        }, false);
        reader.readAsDataURL(file);
      });
    }))
    .then(results => {
      return this.upload(results);
    });
  }

  upload(files) {
    const options = {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({ files })
    };

    return fetch('/upload', options)
      .then(response => {
        return response.json()
          .then(json => {
            json.forEach(file => {
              const id = file.id;
              this.progress(0, 100, file.name);
              this.events.addEventListener(id, data => {
                try {
                  const { message, type } = JSON.parse(data.data);
                  const { total, done } = message;
                  if (total) {
                    this.progress(done, total, file.name);
                  } else {
                    this.log(message, type);
                  }
                } catch (e) {}
              });
            })
          });
      });

  }

  log(message, type) {
    const logs = this.state.logs;
    type = type || 'info';
    logs.push({ message, type, id: logs.length });
    this.setState(logs);
  }

  progress(done, total, id) {
    const progress = this.state.progress || {};
    progress[id] = progress[id] || {};
    progress[id].total = total;
    progress[id].done = done;
    this.setState({ progress });
  }

  render() {
    const className = `droparea ${this.state.active ? 'active' : '' }`;
    const placeholder = 'Drag CSV files here'
    return (
      <div>
        <ErrorMessage message={this.state.error} />
        <div
          className={className}
          onDragOver={e => this.dragover(e)}
          onDragLeave={e => this.dragend(e)}
          onDragEnd={e => this.dragend(e)}
          onDrop={e => this.drop(e)}
          >
          <label>{placeholder}</label>
        </div>
        {
          Object.keys(this.state.progress).map(p => <Progress key={p} name={p} done={this.state.progress[p].done} total={this.state.progress[p].total} />)
        }
      </div>
    );
  }

}

module.exports = Upload;
