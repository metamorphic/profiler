import React from 'react';

class CheckboxListItem extends React.Component {

  static propTypes = {
    label: React.PropTypes.string.isRequired,
    checked: React.PropTypes.bool,
    onChange: React.PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      checked: this.props.checked
    };
    this.onChange = this.onChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      checked: nextProps.checked
    });
  }

  onChange(event) {
    const checked = !!event.target.checked;
    this.setState({checked: checked});
    this.props.onChange(event);
  }

  render() {
    return (
      <div className="checkbox-list-item">
        <label title={this.props.label}>
          <input type="checkbox" checked={this.state.checked}
                 onChange={this.onChange}/>
          {this.props.label}
        </label>
      </div>
    );
  }
}

export default class CheckboxList extends React.Component {

  static propTypes = {
    items: React.PropTypes.array.isRequired,
    selectAll: React.PropTypes.bool,
    onChange: React.PropTypes.func
  };

  static defaultProps = {
    selectAll: true
  };

  constructor(props) {
    super(props);
    this.state = {
      items: this.props.items,
      selectAllChecked: false
    };
    this.renderItem = this.renderItem.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({items: nextProps.items});
  }

  renderItem(item) {
    const onChange = (event) => {
      const value = !!event.target.checked;
      this.props.onChange(event, item.key, value);
    };
    return (
      <CheckboxListItem label={item.label} key={item.key}
                        checked={item.checked}
                        onChange={onChange}/>
    );
  }

  render() {
    const selectAll = (event) => {
      const checked = !!event.target.checked;
      this.setState({
        items: self.state.items.map((item) =>
          cloneItem(item, {
            checked: checked
          })
        ),
        selectAllChecked: checked
      });
      let item;
      for (let i = 0; i < self.state.items.length; i++) {
        item = self.state.items[i];
        this.props.onChange(null, item.key, checked);
      }
    };
    const renderedItems = this.state.items.map(this.renderItem);
    const selectAllComponent = (
      <CheckboxListItem label="Select/Deselect All" key="select-all"
                        checked={this.state.selectAllChecked}
                        onChange={selectAll}/>
    );
    return (
      <div className="checkbox-list">
        {this.props.selectAll ? selectAllComponent : null}
        {renderedItems}
      </div>
    );
  }
}

function cloneItem(item, props) {
  let key, newItem = {};
  if (item && typeof item === 'object') {
    for (key in item) {
      if (item.hasOwnProperty(key)) {
        newItem[key] = item[key];
      }
    }
    if (props && typeof props === 'object') {
      for (key in props) {
        if (props.hasOwnProperty(key)) {
          newItem[key] = props[key];
        }
      }
    }
  }
  return newItem;
}
