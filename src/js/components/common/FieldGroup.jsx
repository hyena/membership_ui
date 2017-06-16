import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import {
  Checkbox,
  Col,
  FormGroup,
  ControlLabel,
  FormControl,
  InputGroup,
  Row
} from 'react-bootstrap'
import classNames from 'classnames'
import { List, Set } from 'immutable'

export default class FieldGroup extends Component {
  render () {
    const {
      formKey,
      label,
      onFormValueChange,
      options,
      optionMap,
      placeHolder,
      ...restInputProps
    } = this.props
    const optionList = []
    let onChange = (e) => onFormValueChange(formKey, e.target.value)
    if (options !== undefined) {
      if (placeHolder !== undefined) {
        optionList.push(
          <option key={formKey + 'placeholder'} value="" disabled>{placeHolder}</option>
        )
      }
      if (this.props.multiple) {
        onChange = (e) => {
          let selected = []
          for (let i = 0; i < e.target.options.length; i++) {
            if (e.target.options[i].selected) {
              selected.push(e.target.options[i].value)
            }
          }
          if (List.isList(this.props.value)) {
            selected = List(selected)
          }
          onFormValueChange(formKey, selected)
        }
      }
      options.forEach(
        (opt, ind) => {
          const key = optionMap ? ind : opt
          optionList.push(
            <option key={key} value={key}>{opt}</option>
          )
        }
      )
    }
    let input
    if (this.props.componentClass === 'select') {
      input = (
        <FormControl
          onChange={(e) => onChange(e)}
          ref="input"
          {...restInputProps}>
          {optionList}
        </FormControl>
      )
    } else if (this.props.componentClass === 'labels') {
      input = (
        <LabelForm
          key={formKey}
          formKey={formKey}
          onFormValueChange={onFormValueChange}
          options={options}
          optionMap={optionMap}
          {...restInputProps}
        />
      )
    } else if (this.props.componentClass === 'checkbox') {
      delete restInputProps.componentClass
      onChange = (e) => onFormValueChange(formKey, e.target.checked)
      input = (
        <Checkbox
          onClick={(e) => onChange(e)}
          checked={this.props.value}
          ref="input"
          {...restInputProps}/>
      )
    } else {
      input = (
        <FormControl
          onChange={(e) => onChange(e)}
          ref="input"
          {...restInputProps}/>
      )
    }
    return (
      <Row>
        <FormGroup controlId={formKey}>
        <Col componentClass={ControlLabel} sm={3}>
            {label}
          </Col>
          <Col sm={9}>
            {input}
          </Col>
        </FormGroup>
      </Row>
    )
  }
}

class LabelForm extends Component {

  constructor (props) {
    super(props)
    this.state = {
      userInput: '',
      options: []
    }
  }

  render () {
    const {
      formKey,  // eslint-disable-line no-unused-vars
      onFormValueChange,  // eslint-disable-line no-unused-vars
      options,  // eslint-disable-line no-unused-vars
      optionMap,  // eslint-disable-line no-unused-vars
      value
    } = this.props
    const labels = []
    value.forEach((label, index) => {
      labels.push(
        <span key={label} className="tag_label">
          {label} <span className="delete" onClick={(event) => this.deleteValue(index)}>x</span>
        </span>
      )
    })
    const classes = classNames('dropup', {
      open: this.state.options.length > 0
    })
    const dropDownOptions = []
    this.options = []
    let optIndex = 0
    this.state.options.forEach(option => {
      const index = optIndex
      dropDownOptions.push(
        <li key={index}>
          <a
            id={`option-${option}`}
            tabIndex="0"
            ref={(a) => { if (a) { this.options.push(a) } }}
            onKeyDown={(e) => this.optionKeyDown(e, index)}
            onClick={(e) => this.selectValue(option)}
          >
            {option}
          </a>
        </li>
      )
      optIndex = optIndex + 1
    })
    return (
      <InputGroup>
        <InputGroup.Addon>{labels}</InputGroup.Addon>
        <div className={classes}>
        <FormControl
          type="text"
          ref={(input) => { this.textInput = input }}
          autoComplete="off"
          value={this.state.userInput}
          onChange={(e) => this.onChange(e.target.value)}
          onKeyDown={(e) => this.keyPress(e)}
        />

          <ul ref={(ul) => { this.dropDown = ul }} className="dropdown-menu">
            {dropDownOptions}
          </ul>
        </div>
      </InputGroup>
    )
  }

  optionKeyDown (event, index) {
    if (event.keyCode === 13) {
      event.preventDefault()
      event.stopPropagation()
      this.selectValue(this.state.options[index])
    } else if (event.keyCode === 38) {
      event.preventDefault()
      event.stopPropagation()
      this.options[(index - 1 + this.options.length) % this.options.length].focus()
    } else if (event.keyCode === 40) {
      event.preventDefault()
      event.stopPropagation()
      this.options[(index + 1) % this.options.length].focus()
    } else if (event.which !== 0) {
      const typed = this.state.userInput
      this.onChange(typed)
    }
  }

  onChange (typed) {
    const options = []
    if (typed.length > 0) {
      const valueSet = Set(this.props.value)
      this.props.options.forEach((label, key) => {
        if (label.includes(typed) && !valueSet.contains(this.props.optionMap ? key : label)) {
          options.push(label)
        }
      })
    }
    this.setState({userInput: typed, options: options})
  }

  keyPress (event) {
    if (event.keyCode === 13) {
      event.preventDefault()
      event.stopPropagation()
      this.selectValue(this.state.userInput)
    } else if (event.keyCode === 38) {
      if (this.state.userInput) {
        event.preventDefault()
        event.stopPropagation()
        this.options[this.options.length - 1].focus()
      }
    }
  }

  selectValue (input) {
    const valueSet = Set(this.props.value)
    this.props.options.forEach((label, key) => {
      if (input === label) {
        const val = this.props.optionMap ? key : label
        if (!valueSet.contains(val)) {
          this.addValue(val)
          return
        }
      }
    })
  }

  addValue (value) {
    if (List.isList(this.props.value)) {
      this.props.onFormValueChange(this.props.formKey, this.props.value.push(value))
    } else {
      let newValues = this.props.value.slice()
      this.props.onFormValueChange(this.props.formKey, newValues)
    }
    this.setState({userInput: '', options: []})
    ReactDOM.findDOMNode(this.textInput).focus()  // eslint-disable-line react/no-find-dom-node
  }

  deleteValue (index) {
    if (List.isList(this.props.value)) {
      this.props.onFormValueChange(this.props.formKey, this.props.value.delete(index))
    } else {
      let newValues = this.props.value.slice()
      newValues.splice(index, 1)
      this.props.onFormValueChange(this.props.formKey, newValues)
    }
  }
}
