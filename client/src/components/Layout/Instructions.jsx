import {
  Stack,
  Heading,
  Icon,
  Button,
  Text,
  Image,
  useMediaQuery
} from '@chakra-ui/react'
import { FiAlertTriangle, FiSun, FiZap } from 'react-icons/fi'
import CHATBOTA from '../../assets/wall-image.png'

export const Instructions = ({ onClick }) => {
  const introdution = [
    {
      icon: FiSun,
      name: 'උදාහරණ',
      list: [
        'quantum computing ගැන සරල වචන වලින් පැහැදිලි කරන්න',
        'අවුරුදු 10 ක දරුවෙකුගේ උපන්දිනය සඳහා නිර්මාණාත්මක අදහස් තිබේද?',
        'JavaScript හි HTTP ඉල්ලීමක් කරන්නේ කෙසේද?',
      ],
    },
    {
      icon: FiZap,
      name: 'හැකියාවන්',
      list: [
        'සංවාදයේදී පරිශීලකයා කලින් පැවසූ දේ මතක තබා ගනී',
        'පසු විපරම් නිවැරදි කිරීම් සැපයීමට පරිශීලකයාට ඉඩ දේ',
        'නුසුදුසු ඉල්ලීම් ප්‍රතික්ෂේප කිරීමට පුහුණු කර ඇත',
      ],
    },
    {
      icon: FiAlertTriangle,
      name: 'සීමාවන්',
      list: [
        'විටින් විට වැරදි තොරතුරු ජනනය විය හැක. විශේෂයෙන්ම සිංහල භාෂා පරිවර්තනයේදී',
        'ඉඳහිට හානිකර උපදෙස් හෝ පක්ෂග්‍රාහී අන්තර්ගතයන් නිපදවිය හැක',
        'නවතම දැනුමට යාවත්කාලීන වී නොපවතී',
      ],
    },
  ]

  const [isSmallHeightAndWidth] = useMediaQuery('(max-height: 932px) and (max-width: 430px)');

  return (
    <Stack
      justifyContent='center'
      alignItems='center'
      height='full'
      overflow='auto'
      flexDirection='column'
    >
      <Image
        boxSize={'auto'} 
        objectFit='contain'
        paddingTop={isSmallHeightAndWidth ? '400' : '0'}
        src={CHATBOTA} 
        alt='CHATBOTA wall image' 
      />
      <Stack direction={['column', 'column', 'row']}>
        {introdution.map(({ icon, list, name }, key) => {
          const handleClick = (text) => {
            if (name == 'උදාහරණ') {
              return () => onClick(text)
            }
            return undefined
          }

          return (
            <Stack key={key} alignItems='center'>
              <Icon as={icon} />
              <Heading size='sm'>{name}</Heading>
              {list.map((text, key) => (
                <Button
                  key={key}
                  maxWidth={64}
                  height='fit-content'
                  padding={4}
                  onClick={handleClick(text)}
                >
                  <Text overflow='hidden' whiteSpace='normal'>
                    {text}
                  </Text>
                </Button>
              ))}
            </Stack>
          )
        })}
      </Stack>
    </Stack>
  )
}
