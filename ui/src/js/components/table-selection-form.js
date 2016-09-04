import React from 'react';
import CheckboxList from './checkbox-list';

export default class TableSelectionForm extends React.Component {

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event, key, value) {
    this.itemMap[key].checked = value;
  }

  handleSubmit() {
    this.props.onSubmit(checkedItems(this.itemMap));
  }

  convertToItem(table) {
    return {
      key: table[0],
      label: table[0],
      checked: !!table[1]
    };
  }

  render() {
    const items = this.props.tables.map(this.convertToItem);
    this.itemMap = createItemMap(items);
    return (
      <div className="table-selection">
        <CheckboxList items={items}
                      onChange={this.handleChange}/>
        <button type="button" className="btn btn-default"
                onClick={this.handleSubmit} data-loading-text="Analyzing..."
                autoComplete="off">Analyze</button>
      </div>
    );
  }
}

function createItemMap(items) {
  let item, itemMap = {};
  for (let i = 0; i < items.length; i++) {
    item = items[i];
    itemMap[item.key] = item;
  }
  return itemMap;
}

function checkedItems(itemMap) {
  let items = [];
  for (let key in itemMap) {
    if (itemMap.hasOwnProperty(key)) {
      if (itemMap[key].checked) {
        items.push(key);
      }
    }
  }
  return items;
}
