import React from 'react';
import Page from './page';
import { render, screen } from '@testing-library/react';
import { Provider } from '@/components/ui/provider';

function chakraRender(x : React.JSX.Element) {
  return render(<Provider>{x}</Provider>);
}

describe('trivial tests', () => {
    test("Deploy Now is in the document", () => {
        const renderData = chakraRender(<Page />);
        const linkElement = screen.getByText(/Deploy Now/i);
        expect(linkElement).toBeInTheDocument();
        renderData.unmount();
    });
});

