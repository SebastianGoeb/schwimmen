import { type ChangeEvent } from "react";
import { range } from "lodash-es";

function cell(x: any, y: any, e: ChangeEvent<HTMLInputElement>) {
  console.log(x, y, e.target.value);
}

function MyComponent() {
  return (
    <table>
      <thead>
        <tr>
          {range(0, 50).map((x) => (
            <th>{x}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {range(0, 50).map((x) => (
          <tr>
            {range(0, 50).map((y) => (
              <td>
                <input type="text" defaultValue={`${x} - ${y}`} onChange={(e) => cell(x, y, e)} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default MyComponent;
