import {
  forwardRef,
  useImperativeHandle,
} from 'react'

import {
  Modal as DefaultModal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'

export const Modal = forwardRef(({ title, ...props }, ref) => {
  const { isOpen, onOpen: handleOpen, onClose: handleClose } = useDisclosure()

  useImperativeHandle(ref, () => ({
    isOpen,
    handleOpen,
    handleClose,
  }))

  return (
    <DefaultModal isOpen={isOpen} onClose={handleClose} isCentered>
      <ModalOverlay />
      <ModalContent maxWidth='fit-content'>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody {...props} />
      </ModalContent>
    </DefaultModal>
  )
})

Modal.displayName = 'Modal'
