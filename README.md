# One Third Window Gnome extension

Position window to a one third of the screen.

The idea of one third window is where you have a ultra wide screen and rather
have a "big" centered window but keep some other windows (2 to be exact) on the
side.

This extension automate it, it add a shortcut (Super+c by default ) to always
center the current or another shortcut (Super+Shift+c) to rotate the postion
from Left to Right.

## Demo

![Alt Text](./examples/one-third-window.gif)

## Settings

A few settings you can adjust :

**Enlarge Width**: How many pixels to enlarge the window with. It by default use one third of the screen and enlarge it by that value. It default to 400 but you can set it to 0 if you want true one third.

**Top Start**: How many pixels to add from the top position. It usually work in case you have a larger panel. It default to 25.

**Height Increase**: How many pixels to increase the window with, you usually
combine this with top start to get it pixel perfect you want. Default to 25

You can set the center or rotate shortcut to your liking.

## Acknowledgement

Move of that code comes from the wonderful
[tactile](https://gitlab.com/lundal/tactile) extension, and it probably much
more flexible and configurable way for window resizing and positioning.

If this extension is not flexible for you enough I encourage you to check out **tactile**.
