import React from 'react';
import ReactDOM from 'react-dom';
import { bindAll, maxBy, minBy, map, slice, uniqBy, without, xor } from 'lodash';
import { dataGenerator } from '../../../utils';
import AxisChart from '../../axis-chart';
import { schemeCategory10, scaleOrdinal } from 'd3';
import { XAxis, YAxis } from '../../axis';

const keyField = 'year_id';
const valueField = 'population';
import Bars from '../src/bars';

const data = dataGenerator({
  primaryKeys: [
    { name: 'location', values: ['Brazil', 'Russia', 'India', 'China', 'Mexico', 'Indonesia', 'Nigeria', 'Vietnam'] }
  ],
  valueKeys: [
    { name: valueField, range: [100, 900], uncertainty: true }
  ]
});

const locationData = [
  { location: 'Brazil', values: data.filter((datum) => { return datum.location === 'Brazil'; }) },
  { location: 'Russia', values: data.filter((datum) => { return datum.location === 'Russia'; }) },
  { location: 'India', values: data.filter((datum) => { return datum.location === 'India'; }) },
  { location: 'China', values: data.filter((datum) => { return datum.location === 'China'; }) },
  { location: 'Mexico', values: data.filter((datum) => { return datum.location === 'Mexico'; }) },
  { location: 'Indonesia', values: data.filter((datum) => { return datum.location === 'Indonesia'; }) },
  { location: 'Nigeria', values: data.filter((datum) => { return datum.location === 'Nigeria'; }) },
  { location: 'Vietnam', values: data.filter((datum) => { return datum.location === 'Vietnam'; }) }
];

const valueFieldDomain = [minBy(data, valueField)[valueField], maxBy(data, valueField)[valueField]];
const keyFieldDomain = map(uniqBy(data, keyField), (obj) => { return (obj[keyField]); });


console.log("hello");
console.log(locationData);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItems: [],
    }

    bindAll(this, [
      'onClick',
      'onMouseLeave',
      'onMouseMove',
      'onMouseOver',
    ]);

  }

  onClick(event, datum) {
    console.log(`${event.type}::${datum[keyField]},${datum[valueField]}`);
    this.setState({
      selectedItems: xor(this.state.selectedItems, [datum]),
    });
  };

  onMouseLeave(event, datum) {
    console.log(`${event.type}::${datum[keyField]},${datum[valueField]}`);
    this.setState({
      focus: {},
    });
  };

  onMouseMove(event, datum) {
    console.log(`${event.type}::${datum[keyField]},${datum[valueField]}`);
  };

  onMouseOver(event, datum) {
    console.log(`${event.type}::${datum[keyField]},${datum[valueField]}`);
    this.setState({
      focus: datum,
    });
  };


  render() {


    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>


        <AxisChart
          height={300}
          width={500}
          xDomain={keyFieldDomain}
          yDomain={valueFieldDomain}
          xScaleType="band"
          yScaleType="linear"
        >
          <XAxis />
          <YAxis />
            <Bars
              fill="steelblue"
              data={data.filter((datum) => { return datum.location === 'India'; })}
              dataAccessors={{
                fill: keyField,
                key: 'id',
                x: keyField,    // year_id
                y: valueField   // population
              }}
              focus={this.state.focus}
              onClick={this.onClick}
              onMouseLeave={this.onMouseLeave}
              onMouseMove={this.onMouseMove}
              onMouseOver={this.onMouseOver}
              selection={this.state.selectedItems}
              paddingInner={0.5}
            />
        </AxisChart>


        <AxisChart
          height={500}
          width={300}
          xDomain={keyFieldDomain}
          yDomain={valueFieldDomain}
          xScaleType="band"
          yScaleType="linear"
        >
          <XAxis
            orientation="left"
          />
          <YAxis
            orientation="bottom"

          />


        </AxisChart>

      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));

