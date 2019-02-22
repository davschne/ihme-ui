import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import pick from 'lodash/pick';

import * as util from '../../../utils';

import Bar from './bar';
import commonProps from './commonProps';

/**
 * `import { GroupedBars } from 'ihme-ui'`
 *
 * Creates the bars for a grouped bar chart.
 * Each category represents a group, and each subcategory represents a single bar in each group.
 */
export default class GroupedBars extends React.PureComponent {
  constructor(props) {
    super(props);

    this.combineStyles = util.memoizeByLastCall(util.combineStyles);
  }

  render() {
    const {
      bandPaddingGroup,
      className,
      clipPathId,
      colorScale,
      data,
      dataAccessors: {
        fill: fillAccessor,
        category: groupAccessor,
        subcategory: subgroupAccessor,
        value: valueAccessor,
      },
      fill,
      focus,
      height,
      orientation,
      rectClassName,
      rectStyle,
      selection,
      style,
      subcategories: subgroups,
    } = this.props;

    const childProps = pick(this.props, [
      'focusedClassName',
      'focusedStyle',
      'onClick',
      'onMouseLeave',
      'onMouseMove',
      'onMouseOver',
      'selectedClassName',
      'selectedStyle',
    ]);

    const vertical = util.isVertical(orientation);
    const domainScale = util.getDomainScale(this.props);
    const rangeScale = util.getRangeScale(this.props);
    const totalBandwidth = domainScale.bandwidth();
    const bandPaddingPx = bandPaddingGroup * totalBandwidth;
    const bandwidth = (totalBandwidth - bandPaddingPx * (subgroups.length - 1)) / subgroups.length;

    function getDomainOffset(group, subgroup) {
      const groupOffset = domainScale(group);
      const subgroupIndex = subgroups.indexOf(subgroup);
      const memberOffset = bandwidth * subgroupIndex + bandPaddingPx * subgroupIndex;
      return groupOffset + memberOffset;
    }

    return (
      <g
        className={className && classNames(className)}
        clipPath={clipPathId && `url(#${clipPathId})`}
        style={this.combineStyles(style, data)}
      >
        {data.map((datum) => {
          const fillValue =
            colorScale && fillAccessor
            ? colorScale(util.propResolver(datum, fillAccessor))
            : fill;
          const group = util.propResolver(datum, groupAccessor);
          const subgroup = util.propResolver(datum, subgroupAccessor);
          const value = util.propResolver(datum, valueAccessor);

          /* eslint-disable no-multi-spaces */
          const x = vertical ? getDomainOffset(group, subgroup) : 0;
          const y = vertical ? rangeScale(value)                : getDomainOffset(group, subgroup);
          const barHeight = vertical ? height - y : bandwidth;
          const barWidth  = vertical ? bandwidth  : rangeScale(value);
          /* eslint-enable no-multi-space */

          return (
            <Bar
              className={rectClassName}
              key={`${group}:${subgroup}`}
              datum={datum}
              x={x}
              y={y}
              height={barHeight}
              width={barWidth}
              fill={fillValue}
              focused={focus === datum}
              selected={selection.includes(datum)}
              style={rectStyle}
              {...childProps}
            />
          );
        })}
      </g>
    );
  }
}

const {
  CommonDefaultProps,
  CommonPropTypes,
} = util;

GroupedBars.propTypes = {
  ...commonProps,

  /**
   * Padding between the bars of each group, specified as a proportion of the band width (i.e. the
   * space allocated for each group).
   */
  bandPaddingGroup: PropTypes.number,

  /**
   * Accessors on datum objects:
   *   fill: used to compute the bar's fill color (the result will be passed to `props.colorScale`)
   *   category (req): used to determine the bar's group (to plot it on the chart domain)
   *   subcateogry (req): used to determine the bar's subcategory within its group
   *   value (req): used to obtain the bar's data value (to plot it on the chart range)
   *
   * Each accessor can either be a string or function.
   * If a string, it is assumed to be the name of a property on datum objects; full paths to nested
   * properties are supported (e.g. `{ x: 'values.year', ... }`).
   * If a function, it is passed the datum as its first and only argument.
   */
  dataAccessors: PropTypes.shape({
    fill: CommonPropTypes.dataAccessor,
    category: CommonPropTypes.dataAccessor.isRequired,
    subcategory: CommonPropTypes.dataAccessor.isRequired,
    value: CommonPropTypes.dataAccessor.isRequired,
  }).isRequired,

  /**
   * List of subcategory names used in the bar chart. In a grouped bar chart, each group contains
   * a bar for each subcategory.
   */
  subcategories: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ])).isRequired,
};

GroupedBars.defaultProps = {
  bandPadding: 0.05,
  bandPaddingGroup: 0.01,
  fill: 'steelblue',
  onClick: CommonDefaultProps.noop,
  onMouseLeave: CommonDefaultProps.noop,
  onMouseMove: CommonDefaultProps.noop,
  onMouseOver: CommonDefaultProps.noop,
  orientation: 'vertical',
};
