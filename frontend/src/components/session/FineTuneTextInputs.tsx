import React, { FC, useState, useCallback, useEffect } from 'react'
import { prettyBytes } from '../../utils/format'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import useThemeConfig from '../../hooks/useThemeConfig'
import useTheme from '@mui/material/styles/useTheme'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ArrowCircleRightIcon from '@mui/icons-material/ArrowCircleRight'

import FileUpload from '../widgets/FileUpload'
import Row from '../widgets/Row'
import Cell from '../widgets/Cell'
import Caption from '../widgets/Caption'

import useSnackbar from '../../hooks/useSnackbar'
import InteractionContainer from './InteractionContainer'

import {
  buttonStates,
} from '../../types'

import {
  mapFileExtension,
} from '../../utils/filestore'

export const FineTuneTextInputs: FC<{
  initialCounter?: number,
  initialFiles?: File[],
  showButton?: boolean,
  showSystemInteraction?: boolean,
  onChange?: {
    (counter: number, files: File[]): void
  },
  onDone?: {
    (manuallyReviewQuestions?: boolean): void
  },
}> = ({
  initialCounter,
  initialFiles,
  showButton = false,
  showSystemInteraction = true,
  onChange,
  onDone,
}) => {
  const snackbar = useSnackbar()

  const [manualTextFileCounter, setManualTextFileCounter] = useState(initialCounter || 0)
  const [manualTextFile, setManualTextFile] = useState('')
  const [manualURL, setManualURL] = useState('')
  const [manuallyReviewQuestions, setManuallyReviewQuestions] = useState(false)
  const [files, setFiles] = useState<File[]>(initialFiles || [])
  const themeConfig = useThemeConfig()
  const theme = useTheme()

  const onAddURL = useCallback(() => {
    if(!manualURL.match(/^https?:\/\//i)) {
      snackbar.error(`Please enter a valid URL`)
      return
    }
    let useUrl = manualURL.replace(/\/$/i, '')
    useUrl = decodeURIComponent(useUrl)
    let fileTitle = useUrl
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '')
    const file = new File([
      new Blob([manualURL], { type: 'text/html' })
    ], `${fileTitle}.url`)
    setFiles(files.concat(file))
    setManualURL('')
  }, [
    manualURL,
    files,
  ])

  const onAddTextFile = useCallback(() => {
    const newCounter = manualTextFileCounter + 1
    setManualTextFileCounter(newCounter)
    const file = new File([
      new Blob([manualTextFile], { type: 'text/plain' })
    ], `textfile-${newCounter}.txt`)
    setFiles(files.concat(file))
    setManualTextFile('')
  }, [
    manualTextFile,
    manualTextFileCounter,
    files,
  ])

  const onDropFiles = useCallback(async (newFiles: File[]) => {
    const existingFiles = files.reduce<Record<string, string>>((all, file) => {
      all[file.name] = file.name
      return all
    }, {})
    const filteredNewFiles = newFiles.filter(f => !existingFiles[f.name])
    setFiles(files.concat(filteredNewFiles))
  }, [
    files,
  ])

  useEffect(() => {
    if(!onChange) return
    onChange(manualTextFileCounter, files)
  }, [
    manualTextFileCounter,
    files,
  ])

  return (
    <Box
      sx={{
        mt: 2,
        width: '100%',
      }}
    >
      {
        showSystemInteraction && (
          <Box
            sx={{
              mt: 4,
              mb: 4,
            }}
          >
            <InteractionContainer
              name="System"
            >
              <Typography className="interactionMessage">
                Add URLs, paste some text or upload some files you want your model to learn from:
              </Typography>
            </InteractionContainer>
          </Box>
        )
      }
      <Row
        sx={{
          width: '100%',
          display: 'flex',
          mb: 2,
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          flexDirection: {
            xs: 'column',
            sm: 'column',
            md: 'row'
          }
        }}
      >
        <Cell
          sx={{
            width: '100%',
            flexGrow: 1,
            pr: 2,
            pb: 1,
          }}
        >
          <TextField
            fullWidth
            label="Add link, for example https://google.com"
            value={ manualURL }
            onChange={ (e) => {
              setManualURL(e.target.value)
            }}
            sx={{
              pb: 1,
              backgroundColor: `${theme.palette.mode === 'light' ? themeConfig.lightBackgroundColor : themeConfig.darkBackgroundColor}80`,
            }}
          />
        </Cell>
        <Cell
          sx={{
            width: '240px',
            minWidth: '240px',
          }}
        >
          <Button
            sx={{
              width: '100%',
            }}
            variant="contained"
            color={ buttonStates.addUrlColor }
            endIcon={<AddCircleIcon />}
            onClick={ onAddURL }
          >
            { buttonStates.addUrlLabel }
          </Button>
        </Cell>
      </Row>
      <Row
        sx={{
          mb: 2,
          alignItems: 'flex-start',
          flexDirection: {
            xs: 'column',
            sm: 'column',
            md: 'row'
          }
        }}
      >
        <Cell
          sx={{
            width: '100%',
            pb: 1,
            flexGrow: 1,
            pr: 2,
            alignItems: 'flex-start',
          }}
        >
          <TextField
            sx={{
              height: '100px',
              maxHeight: '100px',
              pb: 1,
              backgroundColor: `${theme.palette.mode === 'light' ? themeConfig.lightBackgroundColor : themeConfig.darkBackgroundColor}80`,
            }}
            fullWidth
            label="or paste some text here"
            value={ manualTextFile }
            multiline
            rows={ 3 }
            onChange={ (e) => {
              setManualTextFile(e.target.value)
            }}
          />
        </Cell>
        <Cell
          sx={{
            flexGrow: 0,
            width: '240px',
            minWidth: '240px',
          }}
        >
          <Button
            sx={{
              width: '100%',
            }}
            variant="contained"
            color={ buttonStates.addTextColor }
            endIcon={<AddCircleIcon />}
            onClick={ onAddTextFile }
          >
            { buttonStates.addTextLabel }
          </Button>
        </Cell>
        
      </Row>


      <FileUpload
        sx={{
          width: '100%',
        }}
        onlyDocuments
        onUpload={ onDropFiles }
      >
        <Row
          sx={{
            alignItems: 'flex-start',
            flexDirection: {
              xs: 'column',
              sm: 'column',
              md: 'row'
            }
          }}
        >
          <Cell
            sx={{
              width: '100%',
              flexGrow: 1,
              pr: 2,
              pb: 1,
            }}
          >
            <Box
              sx={{
                border: '1px solid #333333',
                borderRadius: '4px',
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                height: '120px',
                minHeight: '120px',
                cursor: 'pointer',
                backgroundColor: `${theme.palette.mode === 'light' ? themeConfig.lightBackgroundColor : themeConfig.darkBackgroundColor}80`,
              }}
            >
              
              <Typography
                sx={{
                  color: '#bbb',
                  width: '100%',
                }}
              >
                drop files here to upload them ...
              </Typography>
              
            </Box>
          </Cell>
          <Cell
            sx={{
              flexGrow: 0,
              width: '240px',
              minWidth: '240px',
            }}
          >
            <Button
              sx={{
                width: '100%',
              }}
              variant="contained"
              color={ buttonStates.uploadFilesColor }
              endIcon={<CloudUploadIcon />}
            >
              { buttonStates.uploadFilesLabel }
            </Button>
          </Cell>
          
        </Row>

        
      </FileUpload>

      <Box
        sx={{
          mt: 2,
          mb: 2,
        }}
      >
        <Grid container spacing={3} direction="row" justifyContent="flex-start">
          {
            files.length > 0 && files.map((file) => {
              return (
                <Grid item xs={12} md={2} key={file.name}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#999'
                    }}
                  >
                    <span className={`fiv-viv fiv-size-md fiv-icon-${mapFileExtension(file.name)}`}></span>
                    <Caption sx={{ maxWidth: '100%'}}>
                      {file.name}
                    </Caption>
                    <Caption>
                      ({prettyBytes(file.size)})
                    </Caption>
                  </Box>
                </Grid>
              )
            })
              
          }
        </Grid>
      </Box>
      {
        files.length > 0 && showButton && onDone && (
          <Grid container spacing={3} direction="row" justifyContent="flex-start">
            <Grid item xs={ 12 }>
              <FormGroup>
                <FormControlLabel control={
                  <Checkbox
                    checked={manuallyReviewQuestions}
                    onChange={(event) => {
                      setManuallyReviewQuestions(event.target.checked)
                    }}
                  />
                } label="Manually review training data before fine-tuning?" />
              </FormGroup>
            </Grid>
            <Grid item xs={ 12 }>
              <Button
                sx={{
                  width: '100%',
                }}
                variant="contained"
                color="secondary"
                endIcon={<ArrowCircleRightIcon />}
                onClick={ () => onDone(manuallyReviewQuestions) }
              >
                Next Step
              </Button>
            </Grid>
          </Grid>
        )
      }
    </Box>
  )   
}

export default FineTuneTextInputs