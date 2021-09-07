import React from 'react';
import LeafyGreenTextInput from '@leafygreen-ui/text-input';

function TextInput(
  props: React.ComponentProps<typeof LeafyGreenTextInput>
): React.ReactElement {
  return <LeafyGreenTextInput {...props} />;
}

export default TextInput;
