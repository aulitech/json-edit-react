/**
 * Additional themes, not included in main package, but exported separately. Can
 * be imported as required, but won't bloat the bundle size if not required.
 */

import { type Theme } from '../types'

export const githubDarkTheme: Theme = {
  displayName: 'Github Dark',
  styles: {
    container: {
      backgroundColor: '#0d1117',
      color: 'white',
    },
    dropZone: 'rgba(165, 214, 255, 0.17)',
    property: '#E6EDF3',
    bracket: '#56d364',
    itemCount: '#8B949E',
    string: '#A5D6FF',
    number: '#D2A8FF',
    boolean: { color: '#FF7B72', fontSize: '90%', fontWeight: 'bold' },
    null: 'green',
    iconCollection: '#D2A8FF',
    iconEdit: '#D2A8FF',
    iconDelete: 'rgb(203, 75, 22)',
    iconAdd: 'rgb(203, 75, 22)',
    iconCopy: '#A5D6FF',
    iconOk: '#56d364',
    iconCancel: 'rgb(203, 75, 22)',
  },
}

export const githubLightTheme: Theme = {
  displayName: 'Github Light',
  styles: {
    container: 'white',
    property: '#1F2328',
    bracket: '#00802e',
    itemCount: '#8B949E',
    string: '#0A3069',
    number: '#953800',
    boolean: { color: '#CF222E', fontSize: '90%', fontWeight: 'bold' },
    null: '#FF7B72',
    iconCollection: '#8250DF',
    iconEdit: '#8250DF',
    iconDelete: 'rgb(203, 75, 22)',
    iconAdd: '#8250DF',
    iconCopy: '#57606A',
  },
}

export const monoDarkTheme: Theme = {
  displayName: 'Black & White',
  fragments: {
    lightText: { color: 'white' },
    midGrey: '#5c5c5c',
  },
  styles: {
    container: ['lightText', { backgroundColor: 'black' }],
    dropZone: '#e0e0e029',
    property: 'lightText',
    bracket: 'midGrey',
    itemCount: '#4a4a4a',
    string: '#a8a8a8',
    number: '#666666',
    boolean: { color: '#848484', fontStyle: 'italic' },
    null: '#333333',
    iconCollection: 'midGrey',
    iconEdit: 'midGrey',
    iconDelete: 'midGrey',
    iconAdd: 'midGrey',
    iconCopy: 'midGrey',
    iconOk: 'midGrey',
    iconCancel: 'midGrey',
  },
}

export const monoLightTheme: Theme = {
  fragments: { midGrey: '#a3a3a3' },
  displayName: 'White & Black',
  styles: {
    container: 'white',
    property: 'black',
    bracket: 'midGrey',
    itemCount: '#b5b5b5',
    string: '#575757',
    number: '#999999',
    boolean: { color: '#7b7b7b', fontStyle: 'italic' },
    null: '#cccccc',
    iconCollection: 'midGrey',
    iconEdit: 'midGrey',
    iconDelete: 'midGrey',
    iconAdd: 'midGrey',
    iconCopy: 'midGrey',
    iconOk: 'midGrey',
    iconCancel: 'midGrey',
  },
}

export const candyWrapperTheme: Theme = {
  displayName: 'Candy Wrapper',
  fragments: {
    minty: { backgroundColor: '#F1FAEE' },
    pale: { color: '#A8DADC' },
    mid: { color: '#457B9D' },
    dark: { color: '#1D3557' },
    pop: { color: '#E63946' },
    darkBlue: { color: '#2B2D42' },
  },
  styles: {
    container: 'minty',
    property: 'pop',
    dropZone: '#eb121217',
    bracket: 'dark',
    itemCount: 'pale',
    string: 'mid',
    number: ['darkBlue', { fontSize: '85%' }],
    boolean: ['mid', { fontStyle: 'italic', fontWeight: 'bold', fontSize: '80%' }],
    null: ['#cccccc', { fontWeight: 'bold' }],
    input: { border: '1px solid rgb(115, 194, 198)' },
    iconCollection: '#1D3557',
    iconEdit: '#457B9D',
    iconDelete: '#E63946',
    iconAdd: '#2B2D42',
    iconCopy: '#1D3557',
    iconCancel: '#E63946',
  },
}

export const psychedelicTheme: Theme = {
  displayName: 'Psychedelic',
  fragments: {
    pale: { color: '#A8DADC' },
    fluroYellow: 'rgb(242, 228, 21)',
    fluroGreen: 'rgb(68, 255, 62)',
    hotPink: '#f7379a',
  },
  styles: {
    container: {
      backgroundColor: 'unset',
      background: 'linear-gradient(90deg, hsla(333, 100%, 53%, 1) 0%, hsla(33, 94%, 57%, 1) 100%)',
      color: 'black',
    },
    dropZone: 'fluroYellow',
    property: 'black',
    bracket: 'fluroYellow',
    itemCount: ['pale', { opacity: 0.7 }],
    string: 'white',
    number: ['#33d9ff', { fontSize: '90%', fontWeight: 'bold' }],
    boolean: ['fluroGreen', { fontWeight: 'bold', fontSize: '80%' }],
    null: [
      'black',
      {
        fontWeight: 'bold',
        opacity: 0.3,
        backgroundColor: 'rgb(255, 255, 255, 0.5)',
        padding: '0 0.4em',
        borderRadius: '0.4em',
      },
    ],
    iconCollection: 'fluroYellow',
    iconEdit: ['black'],
    iconDelete: ['white', { opacity: 0.5 }],
    iconAdd: ['white', { opacity: 0.5 }],
    iconCopy: 'rgb(32, 84, 242)',
    iconOk: 'fluroGreen',
    iconCancel: 'hotPink',
  },
}
