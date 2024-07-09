// @jest-environment jsdom
import { describe, expect, it } from "vitest";
import { glueNodes } from "./glueNodes";

function glueFn(a: any, b: any) {
  return (
    <span>
      {a}-{b}
    </span>
  );
}

describe("glueNodes", () => {
  it("one item", () => {
    const output = <main>{glueNodes([<div>1</div>], glueFn)}</main>;
    expect(output).toMatchInlineSnapshot(`
      <main>
        <div>
          1
        </div>
      </main>
    `);
  });
  it("two items", () => {
    const output = (
      <main>{glueNodes([<div>1</div>, <div>2</div>], glueFn)}</main>
    );
    expect(output).toMatchInlineSnapshot(`
      <main>
        <div>
          1
        </div>
        <span>
          <div>
            1
          </div>
          -
          <div>
            2
          </div>
        </span>
        <div>
          2
        </div>
      </main>
    `);
  });

  it("three items", () => {
    const output = (
      <main>
        {glueNodes([<div>1</div>, <div>2</div>, <div>3</div>], glueFn)}
      </main>
    );
    expect(output).toMatchInlineSnapshot(`
      <main>
        <div>
          1
        </div>
        <span>
          <div>
            1
          </div>
          -
          <div>
            2
          </div>
        </span>
        <div>
          2
        </div>
        <span>
          <div>
            2
          </div>
          -
          <div>
            3
          </div>
        </span>
        <div>
          3
        </div>
      </main>
    `);
  });
});
