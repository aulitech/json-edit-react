import React, { useEffect, useRef, lazy, Suspense } from 'react'
import { useSearch, useLocation } from 'wouter'
import JSON5 from 'json5'
import 'react-datepicker/dist/react-datepicker.css'
import {
  JsonEditor,
  Theme,
  FilterFunction,
  JsonData,
  OnErrorFunction,
  defaultTheme,
  // Additional Themes
  githubDarkTheme,
  githubLightTheme,
  monoLightTheme,
  monoDarkTheme,
  candyWrapperTheme,
  psychedelicTheme,
} from './_imports'
import { FaNpm, FaExternalLinkAlt, FaGithub } from 'react-icons/fa'
import { BiReset } from 'react-icons/bi'
import { AiOutlineCloudUpload } from 'react-icons/ai'
import { useState } from 'react'
import useUndo from 'use-undo'
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Checkbox,
  Select,
  HStack,
  VStack,
  Link,
  Icon,
  CheckboxGroup,
  Spacer,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useToast,
  Tooltip,
} from '@chakra-ui/react'
import logo from './image/logo_400.png'
import { ArrowBackIcon, ArrowForwardIcon, InfoIcon } from '@chakra-ui/icons'
import { demoDataDefinitions } from './demoData'
import { useDatabase } from './useDatabase'
import './style.css'
import { version } from './version'

const CodeEditor = lazy(() => import('./CodeEditor'))

interface AppState {
  rootName: string
  indent: number
  collapseLevel: number
  collapseTime: number
  showCount: 'Yes' | 'No' | 'When closed'
  theme: Theme
  allowEdit: boolean
  allowDelete: boolean
  allowAdd: boolean
  allowCopy: boolean
  sortKeys: boolean
  showIndices: boolean
  showStringQuotes: boolean
  defaultNewValue: string
  searchText: string
  customTextEditor: boolean
}

const themes = [
  defaultTheme,
  githubDarkTheme,
  githubLightTheme,
  monoLightTheme,
  monoDarkTheme,
  candyWrapperTheme,
  psychedelicTheme,
]

function App() {
  const navigate = useLocation()[1]
  const searchString = useSearch()
  const queryParams = new URLSearchParams(searchString)
  const selectedDataSet = queryParams.get('data') ?? 'cato'
  const dataDefinition = demoDataDefinitions[selectedDataSet]

  const [state, setState] = useState<AppState>({
    rootName: dataDefinition.rootName ?? 'data',
    indent: 2,
    collapseLevel: dataDefinition.collapse ?? 2,
    collapseTime: 300,
    showCount: 'No',
    theme: defaultTheme,
    allowEdit: true,
    allowDelete: false,
    allowAdd: true,
    allowCopy: false,
    sortKeys: false,
    showIndices: true,
    showStringQuotes: false,
    defaultNewValue: '',
    searchText: '',
    customTextEditor: false,
  })

  const [isSaving, setIsSaving] = useState(false)
  const previousTheme = useRef<Theme>() // Used when resetting after theme editing
  const toast = useToast()

  const { liveData, loading, updateLiveData } = useDatabase()

  const [
    { present: data, past, future },
    { set: setData, reset, undo: undoData, redo: redoData, canUndo, canRedo },
  ] = useUndo(selectedDataSet === 'editTheme' ? defaultTheme : dataDefinition.data)
  // Provides a named version of these methods (i.e undo.name = "undo")
  const undo = () => undoData()
  const redo = () => redoData()

  useEffect(() => {
    if (selectedDataSet === 'liveData' && !loading && liveData) reset(liveData)
  }, [loading, liveData, reset, selectedDataSet])

  const updateState = (patch: Partial<AppState>) => setState({ ...state, ...patch })

  const toggleState = (field: keyof AppState) => updateState({ [field]: !state[field] })

  const {
    searchText,
    rootName,
    theme,
    indent,
    collapseLevel,
    collapseTime,
    showCount,
    showIndices,
    sortKeys,
    showStringQuotes,
    allowCopy,
    defaultNewValue,
    allowEdit,
    allowDelete,
    allowAdd,
    customTextEditor,
  } = state

  const restrictEdit: FilterFunction | boolean = (() => {
    const customRestrictor = dataDefinition?.restrictEdit
    if (typeof customRestrictor === 'function')
      return (input) => !allowEdit || customRestrictor(input)
    if (customRestrictor !== undefined) return customRestrictor
    return !allowEdit
  })()

  const restrictDelete: FilterFunction | boolean = (() => {
    const customRestrictor = dataDefinition?.restrictDelete
    if (typeof customRestrictor === 'function')
      return (input) => !allowDelete || customRestrictor(input)
    if (customRestrictor !== undefined) return customRestrictor
    return !allowDelete
  })()

  const restrictAdd: FilterFunction | boolean = (() => {
    const customRestrictor = dataDefinition?.restrictAdd
    if (typeof customRestrictor === 'function')
      return (input) => !allowAdd || customRestrictor(input)
    if (customRestrictor !== undefined) return customRestrictor
    return !allowAdd
  })()

  const handleChangeData = (selected: string) => {
    const newDataDefinition = demoDataDefinitions[selected]

    setState({
      ...state,
      searchText: '',
      collapseLevel: newDataDefinition.collapse ?? state.collapseLevel,
      rootName: newDataDefinition.rootName ?? 'data',
      customTextEditor: false,
    })

    switch (selected) {
      case 'editTheme':
        previousTheme.current = theme
        reset(theme)
        break
      case 'liveData':
        if (!liveData) reset({ 'Oops!': "We couldn't load this data, sorry " })
        else reset(liveData)
        break
      default:
        reset(newDataDefinition.data)
    }

    if (selected === 'cato') navigate('./')
    else navigate(`./?data=${selected}`)
  }

  const handleThemeChange = (e) => {
    const theme = themes.find((th) => th.displayName === e.target.value)
    if (!theme) return
    updateState({ theme })
    if (selectedDataSet === 'editTheme') {
      setData(theme)
      previousTheme.current = theme
    }
  }

  const handleHistory = (method: () => void) => {
    if (selectedDataSet === 'editTheme') {
      const theme = (method.name === 'undo' ? past.slice(-1)[0] : future[0]) as Theme
      updateState({ theme })
    }
    method()
  }

  const handleReset = async () => {
    const newState = { ...state }
    newState.searchText = ''

    switch (selectedDataSet) {
      case 'editTheme':
        reset(previousTheme.current ?? defaultTheme)
        newState.theme = previousTheme.current ?? defaultTheme
        break
      case 'liveData':
        setIsSaving(true)
        await updateLiveData(data)
        setIsSaving(false)
        toast({
          title: 'Whoosh!',
          description: 'Data saved!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        reset(data)
        break
      default:
        reset(dataDefinition.data)
    }

    setState(newState)
  }

  return (
    <div className="App">
      <Flex
        px={8}
        pt={4}
        mb={-50}
        align="flex-start"
        justify="space-evenly"
        wrap="wrap"
        gap={4}
        minH="100%"
      >
        <VStack minW={400}>

          <Box position="relative">

            <VStack w="100%" align="flex-end" gap={4}>
              <HStack w="100%" justify='center'>
                <Button
                  colorScheme="primaryScheme"
                  leftIcon={<ArrowBackIcon />}
                  onClick={() => handleHistory(undo)}
                  isDisabled={!canUndo}
                >
                  Undo
                </Button>

                <Button
                  colorScheme="primaryScheme"
                  rightIcon={<ArrowForwardIcon />}
                  onClick={() => handleHistory(redo)}
                  isDisabled={!canRedo}
                >
                  Redo
                </Button>

                <Button
                  colorScheme="accentScheme"
                  leftIcon={selectedDataSet === 'liveData' ? <AiOutlineCloudUpload /> : <BiReset />}
                  variant="outline"
                  onClick={handleReset}
                  visibility={canUndo ? 'visible' : 'hidden'}
                  isLoading={isSaving}
                >
                  {selectedDataSet === 'liveData' ? 'Push to the cloud' : 'Reset'}
                </Button>
              </HStack>
            </VStack>
            <JsonEditor
              data={data}
              setData={setData as (data: JsonData) => void}
              rootName={rootName}
              theme={[theme, dataDefinition?.styles ?? {}, { container: { paddingTop: '1em' } }]}
              indent={indent}
              onUpdate={async (nodeData) => {
                const demoOnUpdate = dataDefinition?.onUpdate ?? (() => undefined)
                const result = await demoOnUpdate(nodeData, toast as (options: unknown) => void)
                if (result) return result
                else {
                  const { newData } = nodeData
                  if (selectedDataSet === 'editTheme') updateState({ theme: newData as Theme })
                }
              }}
              onEdit={dataDefinition?.onEdit ?? undefined}
              onAdd={dataDefinition?.onAdd ?? undefined}
              onError={
                dataDefinition.onError
                  ? (errorData) => {
                      const error = (dataDefinition.onError as OnErrorFunction)(errorData)
                      toast({
                        title: 'ERROR 😢',
                        description: error as any,
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                      })
                    }
                  : undefined
              }
              showErrorMessages={dataDefinition.showErrorMessages}
              collapse={collapseLevel}
              collapseAnimationTime={collapseTime}
              showCollectionCount={
                showCount === 'Yes' ? true : showCount === 'When closed' ? 'when-closed' : false
              }
              enableClipboard={
                allowCopy
                  ? ({ stringValue, type, success, errorMessage }) => {
                      success
                        ? toast({
                            title: `${type === 'value' ? 'Value' : 'Path'} copied to clipboard:`,
                            description: truncate(String(stringValue)),
                            status: 'success',
                            duration: 5000,
                            isClosable: true,
                          })
                        : toast({
                            title: 'Problem copying to clipboard',
                            description: errorMessage,
                            status: 'error',
                            duration: 5000,
                            isClosable: true,
                          })
                    }
                  : false
              }
              // viewOnly
              restrictEdit={restrictEdit}
              // restrictEdit={(nodeData) => !(typeof nodeData.value === 'string')}
              restrictDelete={restrictDelete}
              restrictAdd={restrictAdd}
              restrictTypeSelection={dataDefinition?.restrictTypeSelection}
              restrictDrag={false}
              searchFilter={dataDefinition?.searchFilter}
              searchText={searchText}
              keySort={sortKeys}
              // keySort={
              //   sortKeys
              //     ? (a, b) => {
              //         const nameRev1 = String(a[0]).length
              //         const nameRev2 = String(b[0]).length
              //         if (nameRev1 < nameRev2) {
              //           return -1
              //         }
              //         if (nameRev1 > nameRev2) {
              //           return 1
              //         }
              //         return 0
              //       }
              //     : false
              // }
              defaultValue={dataDefinition?.defaultValue ?? defaultNewValue}
              showArrayIndices={showIndices}
              showStringQuotes={showStringQuotes}
              minWidth={'min(500px, 95vw)'}
              maxWidth="min(670px, 90vw)"
              className="block-shadow"
              stringTruncate={90}
              customNodeDefinitions={dataDefinition?.customNodeDefinitions}
              customText={dataDefinition?.customTextDefinitions}
              // icons={{ chevron: <IconCancel size="1.2em" /> }}
              // customButtons={[
              //   {
              //     Element: () => (
              //       <svg fill="none" viewBox="0 0 24 24" height="1em" width="1em">
              //         <path
              //           fill="currentColor"
              //           fillRule="evenodd"
              //           d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 2c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11z"
              //           clipRule="evenodd"
              //         />
              //         <path fill="currentColor" d="M16 12l-6 4.33V7.67L16 12z" />
              //       </svg>
              //     ),
              //     onClick: (nodeData, e) => console.log(nodeData),
              //   },
              // ]}
              onChange={dataDefinition?.onChange ?? undefined}
              jsonParse={JSON5.parse}
              // keyboardControls={{
              //   cancel: 'Tab',
              //   confirm: { key: 'Enter', modifier: 'Meta' },
              //   objectConfirm: { key: 'Enter', modifier: 'Shift' },
              //   stringLineBreak: { key: 'Enter' },
              //   stringConfirm: { key: 'Enter', modifier: 'Meta' },
              //   clipboardModifier: ['Alt', 'Shift'],
              //   collapseModifier: 'Control',
              //   booleanConfirm: 'Enter',
              //   booleanToggle: 'r',
              // }}
              // insertAtBeginning="object"
              // rootFontSize={20}
              TextEditor={
                customTextEditor
                  ? (props) => (
                      <Suspense
                        fallback={
                          <div className="loading" style={{ height: `${getLineHeight(data)}lh` }}>
                            Loading code editor...
                          </div>
                        }
                      >
                        <CodeEditor {...props} theme={theme?.displayName ?? ''} />
                      </Suspense>
                    )
                  : undefined
              }
            />
          </Box>
        </VStack>
      </Flex>

      <footer>
        <Text fontSize="sm">{`json-edit-react v${version}`}</Text>
      </footer>
    </div>
  )
}

export default App

export const truncate = (string: string, length = 200) =>
  string.length < length ? string : `${string.slice(0, length - 2).trim()}...`

const getLineHeight = (data: JsonData) => JSON.stringify(data, null, 2).split('\n').length
