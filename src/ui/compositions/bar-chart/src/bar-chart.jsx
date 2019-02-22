import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import bindAll from 'lodash/bindAll';
import pick from 'lodash/pick';
import xor from 'lodash/xor';

import * as util from '../../../../utils';

import styles from './style.css';
import AxisChart from '../../../axis-chart';
import { XAxis, YAxis } from '../../../axis';
import {
  Bars,
  GroupedBars,
  StackedBars,
} from '../../../bar';
import ResponsiveContainer from '../../../responsive-container';
import Legend from '../../../legend';

const FOCUSED_STYLE = {
  stroke: '#000',
  strokeWidth: 2,
};

export default class BarChart extends React.PureComponent {
  constructor(props) {
    super(props);

    const initialState = {
      selectedItems: [],
    };
    this.state = util.stateFromPropUpdates(BarChart.propUpdates, {}, props, initialState);
    this.computeDataMax = util.memoizeByLastCall(util.computeDataMax);
    this.computeStackMax = util.memoizeByLastCall(util.computeStackMax);

    bindAll(this, [
      'onClick',
    ]);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      util.stateFromPropUpdates(BarChart.propUpdates, this.props, nextProps, this.state)
    );
  }

  onClick(_, datum) {
    this.setState({
      selectedItems: xor(this.state.selectedItems, [datum]),
    });
  }

  computeRangeMax() {
    const {
      data,
      dataAccessors,
      type,
    } = this.props;

    return type === 'stacked'
      ? this.computeStackMax(data, dataAccessors.category, dataAccessors.value)
      : this.computeDataMax(data, dataAccessors.value);
  }

  renderTitle() {
    const {
      title,
      titleClassName,
      titleStyle,
    } = this.props;

    return (
      <div className={classNames(styles.title, titleClassName)} style={titleStyle}>
        {title}
      </div>
    );
  }

  renderLegend() {
    const {
      legendItems,
      legendAccessors: {
        labelKey,
        shapeColorKey,
        shapeTypeKey,
      },
      legendClassName,
      legendStyle,
    } = this.props;
    if (!legendItems) return null;
    return (
      <div className={classNames(styles.legend, legendClassName)} style={legendStyle}>
        <div className={styles['legend-wrapper']}>
          <Legend
            items={legendItems}
            labelKey={labelKey}
            shapeColorKey={shapeColorKey}
            shapeTypeKey={shapeTypeKey}
          />
        </div>
      </div>
    );
  }

  renderBars() {
    const {
      bandInnerGroupPadding: innerGroupPadding,
      bandInnerPadding: innerPadding,
      bandOuterPadding: outerPadding,
      chartStyle: style,
      onClick = this.onClick,
      type,
    } = this.props;

    const {
      selectedItems: selection,
    } = this.state;

    const rangeMax = this.computeRangeMax();

    const childProps = pick(this.props, [
      'align',
      'bandPadding',
      'categories',
      'subcategories',
      'data',
      'dataAccessors',
      'fill',
      'focus',
      'focusedClassName',
      'focusedStyle',
      'onMouseMove',
      'onMouseOver',
      'onMouseLeave',
      'orientation',
      'rectClassName',
      'rectStyle',
      'selectedClassName',
      'selectedStyle',
    ]);

    const commonProps = {
      innerPadding,
      outerPadding,
      focusedStyle: FOCUSED_STYLE,
      onClick,
      rangeMax,
      selection,
      style,
    };

    switch (type) {
      case 'normal':
        return <Bars {...childProps} {...commonProps} />;
      case 'stacked':
        return <StackedBars {...childProps} {...commonProps} />;
      case 'grouped':
        return (
          <GroupedBars
            innerGroupPadding={innerGroupPadding}
            {...childProps}
            {...commonProps}
          />
        );
      default:
        throw Error(`chart type ${type} invalid; must be one of: 'normal', 'grouped', 'stacked'`);
    }
  }

  renderChart() {
    const {
      categories,
      chartStyle,
      orientation,
      axisLabels: {
        domain: domainLabel,
        range: rangeLabel,
      },
      padding,
    } = this.props;

    const chartRange = [0, this.computeRangeMax()];

    const vertical = util.isVertical(orientation);

    return (
      <div className={classNames(styles.chart, chartStyle)}>
        <ResponsiveContainer>
          <AxisChart
            padding={padding}
            xDomain={vertical ? categories : chartRange}
            yDomain={vertical ? chartRange : categories}
            xScaleType={vertical ? 'band' : 'linear'}
            yScaleType={vertical ? 'linear' : 'band'}
          >
            <XAxis label={vertical ? domainLabel : rangeLabel} />
            <YAxis label={vertical ? rangeLabel : domainLabel} />
            {this.renderBars()}
          </AxisChart>
        </ResponsiveContainer>
      </div>
    );
  }

  render() {
    const {
      className,
      displayLegend,
      style,
      title,
    } = this.props;

    return (
      <div className={classNames(styles['chart-container'], className)} style={style}>
        {title ? this.renderTitle() : null}
        {this.renderChart()}
        {displayLegend ? this.renderLegend() : null}
      </div>
    );
  }
}

const { CommonPropTypes } = util;

BarChart.propTypes = {
  /**
   * label text for axes
   */
  axisLabels: PropTypes.shape({
    domain: PropTypes.string,
    range: PropTypes.string
  }),

  /**
   * Alignment of each bar within its band. If there is any padding between bars, this property
   * specifies how that space will be allocated. The value must be in the range [0, 1], where:
   * - 0 represents left alignment
   * - 0.5 represents center alignment
   * - 1 represents right alignment
   *
   * See: https://github.com/d3/d3-scale/blob/master/README.md#band_align
   */
  align: PropTypes.number,

  /**
   * A convenience for setting the `bandInnerPadding` and `bandOuterPadding` to the same value.
   *
   * See: https://github.com/d3/d3-scale/blob/master/README.md#band_padding
   */
  bandPadding: PropTypes.number,

  /**
   * Padding between the bars of each group, specified as a proportion of the band width (i.e. the
   * space allocated for each group). Only used for a grouped bar chart.
   */
  bandInnerGroupPadding: PropTypes.number,

  /**
   * Padding between bars, specified as a proportion of the band width (i.e. the space allocated
   * for each bar). The value must be in the range [0, 1], where:
   * - 0 represents no padding between bars
   * - 0.5 represents padding of the same width as the bars
   * - 1 represents all padding, giving bars a width of 0 (probably not very useful)
   *
   * See: https://github.com/d3/d3-scale/blob/master/README.md#band_paddingInner
   */
  bandInnerPadding: PropTypes.number,

  /**
   * Padding before the first bar and after the last bar, specified as a proportion (or multiple)
   * of the band width (i.e. the space allocated for each bar).
   *
   * See: https://github.com/d3/d3-scale/blob/master/README.md#band_paddingOuter
   */
  bandOuterPadding: PropTypes.number,

  /**
   * List of category names used in the bar chart. Categories are arrayed across the domain.
   * For a normal bar chart, each category is represented by a single bar.
   * For stacked bars, each category is represented by a single stack.
   * For grouped bars, each category is represented by a single group.
   */
  categories: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ])).isRequired,

  /**
   * List of subcategory names used in the bar chart.
   * In a stacked bar chart, each stack contains a layer for each subcategory.
   * In a grouped bar chart, each group contains a bar for each subcategory.
   */
  subcategories: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number])),

  /**
   * inline styles applied to the element wrapping the chart (included axes)
   */
  chartStyle: CommonPropTypes.style,

  /**
   * className applied to outermost container element
   */
  className: CommonPropTypes.className,

  /**
   * Array of datum objects. A datum object can be just about anything. The only restriction is
   * that it must be possible to obtain the category and value (and, for grouped or stacked bar
   * charts, the subcategory) of each datum using the `dataAccessors`.
   */
  data: PropTypes.arrayOf(PropTypes.object).isRequired,

  /**
   * Accessors on datum objects:
   *   category: used to determine the bar's category (to plot it on the chart domain).
   *     In a stacked bar chart, it represents the stack.
   *     In a grouped bar chart, it represents the group.
   *   subcategory: for a grouped or stacked bar chart, used to determine the bar's subcategory
   *     (layer in a stack or member of group)
   *   value: used to obtain the bar's data value (to plot it on the chart range)
   *
   * Each accessor can either be a string or function.
   * If a string, it is assumed to be the name of a property on datum objects; full paths to nested
   * properties are supported (e.g. `{ x: 'values.year', ... }`).
   * If a function, it is passed the datum as its first and only argument.
   */
  dataAccessors: PropTypes.shape({
    category: PropTypes.string.isRequired,
    subcategory: PropTypes.string,
    value: PropTypes.string.isRequired,
  }).isRequired,

  /**
   * display a legend?
   */
  displayLegend: PropTypes.bool,

  /**
   * either a string representing the fill color (in which case the same color is used for all bars)
   * or a function taking the `datum` and returning a string representing the fill color
   */
  fill: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

  /**
   * the datum object corresponding to the `<Bar />` currently focused
   */
  focus: PropTypes.object,

  /**
   * className applied if `<Bar />` has focus
   */
  focusedClassName: CommonPropTypes.className,

  /**
   * inline styles applied to focused `<Bar />`
   * If an object, spread into inline styles. If a function, passed underlying datum corresponding
   * to its `<Bar />`, and return value is spread into inline styles.
   * signature: (datum) => obj
   */
  focusedStyle: CommonPropTypes.style,

  /**
   * Accessors to `legendItems` objects:
   *    labelKey: used to get the legend item label
   *    shapeColorKey: used to get the shape color
   *    shapeTypeKey: used to get the shape type
   *
   * Required if `displayLegend` is `true`.
   */
  legendAccessors: PropTypes.shape({
    labelKey: CommonPropTypes.dataAccessor,
    shapeColorKey: CommonPropTypes.dataAccessor,
    shapeTypeKey: CommonPropTypes.dataAccessor,
  }),

  /**
   * Array of objects used to build items in the legend. These objects can be just about anything.
   * The only restriction is that it must be possible to obtain the label, shape color, and shape
   * type for the legend item using the `legendAccessors`.
   *
   * Required if `displayLegend` is `true`.
   */
  legendItems: PropTypes.arrayOf(PropTypes.object),

  /**
   * className applied to element wrapping the legend
   */
  legendClassName: CommonPropTypes.className,

  /**
   * inline styles applied to element wrapping the legend
   */
  legendStyle: CommonPropTypes.style,

  /**
   * onClick callback applied to each `<Bar />`.
   * signature: (SyntheticEvent, datum, instance) => {...}
   */
  onClick: PropTypes.func,

  /**
   * onMouseLeave callback applied to each `<Bar />`.
   * signature: (SyntheticEvent, datum, instance) => {...}
   */
  onMouseLeave: PropTypes.func,

  /**
   * onMouseMove callback applied to each `<Bar />`.
   * signature: (SyntheticEvent, datum, instance) => {...}
   */
  onMouseMove: PropTypes.func,

  /**
   * onMouseOver callback applied to each `<Bar />`.
   * signature: (SyntheticEvent, datum, instance) => {...}
   */
  onMouseOver: PropTypes.func,

  /**
   * orientation of bar chart, representing the direction in which bars extend from the domain axis
   */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),

  /**
   * padding around the chart contents
   */
  padding: PropTypes.shape({
    top: PropTypes.number,
    bottom: PropTypes.number,
    right: PropTypes.number,
    left: PropTypes.number,
  }),

  /**
   * className applied to each `<Bar />`
   */
  rectClassName: CommonPropTypes.className,

  /**
   * inline styles passed to each `<Bar />`
   */
  rectStyle: CommonPropTypes.style,

  /**
   * className applied to `<Bar />`s if selected
   */
  selectedClassName: CommonPropTypes.className,

  /**
   * inline styles applied to selected `<Bar />`s.
   * If an object, spread into inline styles.
   * If a function, passed underlying datum corresponding to its `<Bar />`,
   * and return value is spread into inline styles;
   * signature: (datum) => obj
   */
  selectedStyle: CommonPropTypes.style,

  /**
   * datum object or array of datum objects corresponding to selected `<Bar />`s
   */
  selection: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),

  /**
   * inline styles applied to outermost container element
   */
  style: CommonPropTypes.style,

  /**
   * title text for the chart
   */
  title: PropTypes.string,

  /**
   * className applied to element wrapping the title
   */
  titleClassName: CommonPropTypes.className,

  /**
   * inline styles applied to element wrapping the title
   */
  titleStyle: CommonPropTypes.style,

  /**
   * bar chart type
   */
  type: PropTypes.oneOf(['normal', 'stacked', 'grouped']),
};

BarChart.defaultProps = {
  orientation: 'vertical',
  displayLegend: false,
  type: 'normal',
};
