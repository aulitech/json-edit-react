import React, { useEffect, useState, useMemo, useRef } from 'react'
import { ValueNodeWrapper } from './ValueNodeWrapper'
import { EditButtons, InputButtons } from './ButtonPanels'
import { getCustomNode } from './CustomNode'
import {
  type CollectionNodeProps,
  type NodeData,
  type CollectionData,
  type ValueData,
} from './types'
import { Icon } from './Icons'
import {
  filterNode,
  getModifier,
  getNextOrPrevious,
  insertCharInTextArea,
  isCollection,
} from './helpers'
import { AutogrowTextArea } from './AutogrowTextArea'
import { useTheme, useTreeState } from './contexts'
import { useCollapseTransition, useCommon, useDragNDrop } from './hooks'

export const CollectionNode: React.FC<CollectionNodeProps> = (props) => {
  const { getStyles } = useTheme()
  const {
    collapseState,
    setCollapseState,
    doesPathMatch,
    currentlyEditingElement,
    setCurrentlyEditingElement,
    areChildrenBeingEdited,
  } = useTreeState()
  const {
    mainContainerRef,
    data,
    nodeData: incomingNodeData,
    parentData,
    showCollectionCount,
    onEdit,
    onAdd,
    onDelete,
    canDragOnto,
    collapseFilter,
    collapseAnimationTime,
    onMove,
    enableClipboard,
    searchFilter,
    searchText,
    indent,
    sort,
    showArrayIndices,
    defaultValue,
    translate,
    customNodeDefinitions,
    jsonParse,
    jsonStringify,
    TextEditor,
    keyboardControls,
    handleKeyboard,
    insertAtTop,
  } = props
  const [stringifiedValue, setStringifiedValue] = useState(jsonStringify(data))

  const startCollapsed = collapseFilter(incomingNodeData)

  const { contentRef, isAnimating, maxHeight, collapsed, animateCollapse, cssTransitionValue } =
    useCollapseTransition(data, collapseAnimationTime, startCollapsed, mainContainerRef)

  const {
    pathString,
    nodeData,
    path,
    name,
    size,
    canEdit,
    canDelete,
    canAdd,
    canDrag,
    error,
    setError,
    onError,
    handleEditKey,
    derivedValues,
  } = useCommon({ props, collapsed })

  const { dragSourceProps, getDropTargetProps, BottomDropTarget, DropTargetPadding } = useDragNDrop(
    { canDrag, canDragOnto, path, nodeData, onMove, onError, translate }
  )

  // This allows us to not render the children on load if they're hidden (which
  // gives a big performance improvement with large data sets), but still keep
  // the animation transition when opening and closing the accordion
  const hasBeenOpened = useRef(!startCollapsed)

  // DERIVED VALUES (this makes the JSX conditional logic easier to follow
  // further down)
  const { isEditing, isEditingKey, isArray, canEditKey } = derivedValues

  useEffect(() => {
    setStringifiedValue(jsonStringify(data))
    if (isEditing) setCurrentlyEditingElement(null)
  }, [data])

  useEffect(() => {
    const shouldBeCollapsed = collapseFilter(nodeData) && !isEditing
    hasBeenOpened.current = !shouldBeCollapsed
    animateCollapse(shouldBeCollapsed)
  }, [collapseFilter])

  useEffect(() => {
    if (collapseState !== null && doesPathMatch(path)) {
      hasBeenOpened.current = true
      animateCollapse(collapseState.collapsed)
    }
  }, [collapseState])

  // For JSON-editing TextArea
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const getDefaultNewValue = useMemo(
    () => (nodeData: NodeData, newKey: string) => {
      if (typeof defaultValue !== 'function') return defaultValue
      return defaultValue(nodeData, newKey)
    },
    [defaultValue]
  )

  const {
    CustomNode,
    customNodeProps,
    CustomWrapper,
    wrapperProps = {},
    hideKey,
    showEditTools = true,
    showOnEdit,
    showOnView,
    showCollectionWrapper = true,
  } = useMemo(() => getCustomNode(customNodeDefinitions, nodeData), [data])

  const childrenEditing = areChildrenBeingEdited(pathString)

  // For when children are accessed via Tab
  if (childrenEditing && collapsed) animateCollapse(false)

  // Early return if this node is filtered out
  const isVisible =
    filterNode('collection', nodeData, searchFilter, searchText) || nodeData.level === 0
  if (!isVisible && !childrenEditing) return null

  const collectionType = Array.isArray(data) ? 'array' : 'object'
  const brackets =
    collectionType === 'array' ? { open: '[', close: ']' } : { open: '{', close: '}' }

  const handleKeyPressEdit = (e: React.KeyboardEvent) => {
    // Normal "Tab" key functionality in TextArea
    // Defined here explicitly rather than in handleKeyboard as we *don't* want
    // to override the normal Tab key with the custom "Tab" key value
    if (e.key === 'Tab' && !e.getModifierState('Shift')) {
      e.preventDefault()
      const newValue = insertCharInTextArea(
        textAreaRef as React.MutableRefObject<HTMLTextAreaElement>,
        '\t'
      )
      setStringifiedValue(newValue)
      return
    }
    handleKeyboard(e, {
      objectConfirm: handleEdit,
      cancel: handleCancel,
    })
  }

  const handleCollapse = (e: React.MouseEvent) => {
    const modifier = getModifier(e)
    if (modifier && keyboardControls.collapseModifier.includes(modifier)) {
      hasBeenOpened.current = true
      setCollapseState({ collapsed: !collapsed, path })
      return
    }
    if (!(currentlyEditingElement && currentlyEditingElement.includes(pathString))) {
      hasBeenOpened.current = true
      setCollapseState(null)
      animateCollapse(!collapsed)
    }
  }

  const handleEdit = () => {
    try {
      const value = jsonParse(stringifiedValue)
      setCurrentlyEditingElement(null)
      setError(null)
      if (JSON.stringify(value) === JSON.stringify(data)) return
      onEdit(value, path).then((error) => {
        if (error) {
          onError({ code: 'UPDATE_ERROR', message: error }, value as CollectionData)
        }
      })
    } catch {
      onError(
        { code: 'INVALID_JSON', message: translate('ERROR_INVALID_JSON', nodeData) },
        stringifiedValue
      )
    }
  }

  const handleAdd = (key: string) => {
    animateCollapse(false)
    const newValue = getDefaultNewValue(nodeData, key)
    if (collectionType === 'array') {
      const index = insertAtTop.array ? 0 : (data as unknown[]).length
      const options = insertAtTop.array ? { insert: true } : {}
      onAdd(newValue, [...path, index], options).then((error) => {
        if (error) onError({ code: 'ADD_ERROR', message: error }, newValue as CollectionData)
      })
    } else if (key in data) {
      onError({ code: 'KEY_EXISTS', message: translate('ERROR_KEY_EXISTS', nodeData) }, key)
    } else {
      const options = insertAtTop.object ? { insertBefore: 0 } : {}
      onAdd(newValue, [...path, key], options).then((error) => {
        if (error) onError({ code: 'ADD_ERROR', message: error }, newValue as CollectionData)
      })
    }
  }

  const handleDelete =
    path.length > 0
      ? () => {
          onDelete(data, path).then((error) => {
            if (error) {
              onError({ code: 'DELETE_ERROR', message: error }, data)
            }
          })
        }
      : undefined

  const handleCancel = () => {
    setCurrentlyEditingElement(null)
    setError(null)
    setStringifiedValue(jsonStringify(data))
  }

  const showLabel = showArrayIndices || !isArray
  const showCount = showCollectionCount === 'when-closed' ? collapsed : showCollectionCount
  const showEditButtons = !isEditing && showEditTools
  const showKey = showLabel && !hideKey && name !== undefined
  const showCustomNodeContents =
    CustomNode && ((isEditing && showOnEdit) || (!isEditing && showOnView))

  const keyValueArray = Object.entries(data).map(
    ([key, value]) =>
      [collectionType === 'array' ? Number(key) : key, value] as [string | number, ValueData]
  )

  if (collectionType === 'object') sort<[string | number, ValueData]>(keyValueArray, (_) => _)

  const CollectionChildren = !hasBeenOpened.current ? null : !isEditing ? (
    keyValueArray.map(([key, value], index) => {
      const childNodeData = {
        key,
        value,
        path: [...path, key],
        level: path.length + 1,
        index,
        size: isCollection(value) ? Object.keys(value as object).length : 1,
        parentData: data,
        fullData: nodeData.fullData,
      }
      return (
        <div
          className="jer-collection-element"
          key={key}
          style={getStyles('collectionElement', childNodeData)}
        >
          {isCollection(value) ? (
            <CollectionNode
              key={key}
              {...props}
              data={value}
              parentData={data}
              nodeData={childNodeData}
              showCollectionCount={showCollectionCount}
              canDragOnto={canEdit}
            />
          ) : (
            <ValueNodeWrapper
              key={key}
              {...props}
              data={value}
              parentData={data}
              nodeData={childNodeData}
              canDragOnto={canEdit}
              showLabel={collectionType === 'object' ? true : showArrayIndices}
            />
          )}
        </div>
      )
    })
  ) : (
    <div className="jer-collection-text-edit">
      {TextEditor ? (
        <TextEditor
          value={stringifiedValue}
          onChange={setStringifiedValue}
          onKeyDown={(e) =>
            handleKeyboard(e, {
              objectConfirm: handleEdit,
              cancel: handleCancel,
            })
          }
        />
      ) : (
        <AutogrowTextArea
          textAreaRef={textAreaRef}
          className="jer-collection-text-area"
          name={pathString}
          value={stringifiedValue}
          setValue={setStringifiedValue}
          isEditing={isEditing}
          handleKeyPress={handleKeyPressEdit}
          styles={getStyles('input', nodeData)}
        />
      )}
      <div className="jer-collection-input-button-row">
        <InputButtons onOk={handleEdit} onCancel={handleCancel} nodeData={nodeData} />
      </div>
    </div>
  )

  // If the collection wrapper (expand icon, brackets, etc) is hidden, there's
  // no way to open a collapsed custom node, so this ensures it will stay open.
  // It can still be displayed collapsed by handling it internally if this is
  // desired.
  // Also, if the node is editing via "Tab" key, it's parent must be opened,
  // hence `childrenEditing` check
  const isCollapsed = !showCollectionWrapper ? false : collapsed && !childrenEditing
  if (!isCollapsed) hasBeenOpened.current = true

  const customNodeAllProps = {
    ...props,
    data,
    value: data,
    parentData,
    nodeData,
    setValue: async (val: unknown) => await onEdit(val, path),
    handleEdit,
    handleCancel,
    handleKeyPress: handleKeyPressEdit,
    isEditing,
    setIsEditing: () => setCurrentlyEditingElement(path),
    getStyles,
    canDragOnto: canEdit,
  }

  const CollectionContents = showCustomNodeContents ? (
    <CustomNode customNodeProps={customNodeProps} {...customNodeAllProps}>
      {CollectionChildren}
    </CustomNode>
  ) : (
    CollectionChildren
  )

  const KeyDisplay = isEditingKey ? (
    <input
      className="jer-input-text jer-key-edit"
      type="text"
      name={pathString}
      defaultValue={name}
      autoFocus
      onFocus={(e) => e.target.select()}
      onKeyDown={(e) =>
        handleKeyboard(e, {
          stringConfirm: () => handleEditKey((e.target as HTMLInputElement).value),
          cancel: handleCancel,
          tabForward: () => {
            handleEditKey((e.target as HTMLInputElement).value)
            const firstChildKey = keyValueArray?.[0][0]
            setCurrentlyEditingElement(
              firstChildKey
                ? [...path, firstChildKey]
                : getNextOrPrevious(nodeData.fullData, path, 'next', sort)
            )
          },
          tabBack: () => {
            handleEditKey((e.target as HTMLInputElement).value)
            setCurrentlyEditingElement(getNextOrPrevious(nodeData.fullData, path, 'prev', sort))
          },
        })
      }
      style={{ width: `${String(name).length / 1.5 + 0.5}em` }}
    />
  ) : (
    showKey && (
      <span
        className="jer-key-text"
        style={getStyles('property', nodeData)}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={() => canEditKey && setCurrentlyEditingElement(path, 'key')}
      >
        {name === '' ? (
          <span className={path.length > 0 ? 'jer-empty-string' : undefined}>
            {/* display "<empty string>" using pseudo class CSS */}
          </span>
        ) : (
          `${name}:`
        )}
      </span>
    )
  )

  const EditButtonDisplay = showEditButtons && (
    <EditButtons
      startEdit={
        canEdit
          ? () => {
              hasBeenOpened.current = true
              setCurrentlyEditingElement(path)
            }
          : undefined
      }
      handleAdd={canAdd ? handleAdd : undefined}
      handleDelete={canDelete ? handleDelete : undefined}
      enableClipboard={enableClipboard}
      type={collectionType}
      nodeData={nodeData}
      translate={translate}
      customButtons={props.customButtons}
      keyboardControls={keyboardControls}
      handleKeyboard={handleKeyboard}
    />
  )

  const CollectionNodeComponent = (
    <div
      className="jer-component jer-collection-component"
      style={{
        marginLeft: `${path.length === 0 ? 0 : indent / 2}em`,
        ...getStyles('collection', nodeData),
        position: 'relative',
      }}
      draggable={canDrag}
      {...dragSourceProps}
      {...getDropTargetProps('above')}
    >
      <div
        className="jer-clickzone"
        style={{
          width: `${indent / 2 + 1}em`,
          zIndex: 10 + nodeData.level * 2,
        }}
        onClick={(e) => handleCollapse(e)}
      />
      {!isEditing && BottomDropTarget}
      <DropTargetPadding position="above" nodeData={nodeData} />
      {showCollectionWrapper ? (
        <div
          className="jer-collection-header-row"
          style={{ position: 'relative' }}
          onClick={(e) => handleCollapse(e)}
        >
          <div className="jer-collection-name">
            <div
              className={`jer-collapse-icon jer-accordion-icon${collapsed ? ' jer-rotate-90' : ''}`}
              style={{ zIndex: 11 + nodeData.level * 2, transition: cssTransitionValue }}
              onClick={(e) => handleCollapse(e)}
            >
              <Icon name="chevron" rotate={collapsed} nodeData={nodeData} />
            </div>
            {KeyDisplay}
            {!isEditing && (
              <span
                className="jer-brackets jer-bracket-open"
                style={getStyles('bracket', nodeData)}
              >
                {brackets.open}
              </span>
            )}
          </div>
          {!isEditing && showCount && (
            <div
              className={`jer-collection-item-count${showCount ? ' jer-visible' : ' jer-hidden'}`}
              style={{ ...getStyles('itemCount', nodeData), transition: cssTransitionValue }}
            >
              {size === 1
                ? translate('ITEM_SINGLE', { ...nodeData, size: 1 }, 1)
                : translate('ITEMS_MULTIPLE', nodeData, size as number)}
            </div>
          )}
          <div
            className={`jer-brackets${isCollapsed ? ' jer-visible' : ' jer-hidden'}`}
            style={{ ...getStyles('bracket', nodeData), transition: cssTransitionValue }}
          >
            {brackets.close}
          </div>
          {EditButtonDisplay}
        </div>
      ) : hideKey ? (
        <></>
      ) : (
        <div className="jer-collection-header-row" style={{ position: 'relative' }}>
          {KeyDisplay}
          {EditButtonDisplay}
        </div>
      )}
      <div
        className={'jer-collection-inner'}
        style={{
          overflowY: isCollapsed || isAnimating ? 'clip' : 'visible',
          // Prevent collapse if this node or any children are being edited
          maxHeight: childrenEditing ? undefined : maxHeight,
          ...getStyles('collectionInner', nodeData),
          transition: cssTransitionValue,
        }}
        ref={contentRef}
      >
        {CollectionContents}
        <div className={isEditing ? 'jer-collection-error-row' : 'jer-collection-error-row-edit'}>
          {error && (
            <span className="jer-error-slug" style={getStyles('error', nodeData)}>
              {error}
            </span>
          )}
        </div>
        {!isEditing && showCollectionWrapper && (
          <div
            className="jer-brackets jer-bracket-outside"
            style={{
              ...getStyles('bracket', nodeData),
              marginLeft: `${indent < 3 ? -1 : indent < 6 ? -0.5 : 0}em`,
            }}
          >
            {brackets.close}
          </div>
        )}
      </div>
      <DropTargetPadding position="below" nodeData={nodeData} />
    </div>
  )

  return CustomWrapper ? (
    <CustomWrapper customNodeProps={wrapperProps} {...customNodeAllProps}>
      {CollectionNodeComponent}
    </CustomWrapper>
  ) : (
    CollectionNodeComponent
  )
}
