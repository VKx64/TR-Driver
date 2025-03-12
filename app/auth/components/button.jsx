import { Text, TouchableOpacity } from 'react-native';

export default function Button({ onPress, title }) {
  return (
    <TouchableOpacity onPress={onPress} className="bg-blue-500 px-4 py-2 rounded">
      <Text className="text-white text-center">{title}</Text>
    </TouchableOpacity>
  );
}
