import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import BaseSelect from 'react-virtualized-select';
import { assign } from 'lodash';

import { stateFromPropUpdates, propsChanged } from '../../../utils';
import { FLIP_MENU_UPWARDS_INLINE_STYLE, getWidestLabel } from './utils';

import style from './select.css';
import defaultOptionRenderer from './option-renderer';
import inputRenderer from './input-renderer';

function retNull() {
  return null;
}

export default class Select extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = stateFromPropUpdates(Select.propUpdates, {}, props, {});
  }

  componentWillReceiveProps(nextProps) {
    this.setState(
      stateFromPropUpdates(Select.propUpdates, this.props, nextProps, {})
    );
  }

  render() {
    const {
      menuContainerStyle,
      menuStyle,
      wrapperStyle,
    } = this.state;

    const {
      className,
      clearable,
      disabled,
      hierarchical,
      multi,
      optionHeight,
      optionRenderer,
      optionStyle,
      placeholder,
      resetValue,
      value,
    } = this.props;

    const computedClassName = classNames(
      multi ? style['multi-select'] : style['single-select'],
      style.select,
      className
    );

    return (
      <BaseSelect
        {...this.props}
        autosize={false}
        className={computedClassName}
        clearable={clearable}
        closeOnSelect={!multi}
        inputProps={multi ? { placeholder: `Add/Remove... (${value.length})` } : {}}
        inputRenderer={multi && inputRenderer}
        isDisabled={disabled}
        menuContainerStyle={menuContainerStyle}
        menuStyle={menuStyle}
        multi={multi}
        optionHeight={optionHeight}
        optionRenderer={optionRenderer({ hierarchical, multi, optionStyle })}
        placeholder={!multi && (placeholder || 'Add/Remove...')}
        removeSelected={false}
        resetValue={resetValue || (multi ? [] : null)}
        searchable
        valueComponent={multi && retNull}
        wrapperStyle={wrapperStyle}
      />
    );
  }
}

const selectPropTypes = {
  /* render the clear selection "X" to reset the value */
  clearable: PropTypes.bool,

  /* disable the select dropdown */
  disabled: PropTypes.bool,

  /* drop down will flip up */
  menuUpward: PropTypes.bool,

  /* allow multiple selections */
  multi: PropTypes.bool,

  /* function to render option components */
  optionRenderer: PropTypes.func,

  /* styles to pass to <Option />; if a func, passed option object */
  optionStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.func,
  ]),

  /* width applied to outermost wrapper */
  width: PropTypes.number,

  /* width added to widest label (in px) */
  widthPad: PropTypes.number,
};

Select.propTypes = assign({}, BaseSelect.propTypes, selectPropTypes);

Select.defaultProps = {
  clearable: true,
  disabled: false,
  optionHeight: 20,
  optionRenderer: defaultOptionRenderer,
  widthPad: 60,
};

Select.propUpdates = {
  menu(state, _, prevProps, nextProps) {
    if (!propsChanged(prevProps, nextProps, [
      'hierarchical',
      'labelKey',
      'menuContainerStyle',
      'menuStyle',
      'options',
      'widthPad',
    ])) {
      return state;
    }

    const menuWidth = getWidestLabel(
      nextProps.options,
      nextProps.labelKey,
      nextProps.hierarchical
    ) + nextProps.widthPad;

    // if menu width changes, also set menuStyle and menuContainerStyle
    // also create new HoC for menuRenderer
    return assign(
      {},
      state,
      {
        menuContainerStyle: assign(
          {},
          { width: `${menuWidth}px` },
          nextProps.menuContainerStyle,
          nextProps.menuUpward && FLIP_MENU_UPWARDS_INLINE_STYLE
        ),
        menuStyle: assign(
          {},
          { overflow: 'hidden', width: `${menuWidth}px` },
          nextProps.menuStyle
        ),
      }
    );
  },
  wrapperStyle(state, _, prevProps, nextProps) {
    if (!propsChanged(prevProps, nextProps, ['width', 'wrapperStyle'])) {
      return state;
    }

    return assign({}, state, {
      wrapperStyle: assign({}, { width: `${nextProps.width}px` }, nextProps.wrapperStyle),
    });
  }
};
