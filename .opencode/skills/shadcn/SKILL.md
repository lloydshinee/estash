---
name: shadcn
description: Manages shadcn components and projects — adding, searching, fixing, debugging, styling, and composing UI. Provides project context, component docs, and usage examples. Applies when working with shadcn/ui, component registries, presets, --preset codes, or any project with a components.json file.
license: MIT
compatibility: opencode
metadata:
  author: shadcn
  version: "1.0.0"
  source: "shadcn/ui"
---

# shadcn/ui Component Management

Comprehensive skill for managing shadcn/ui components and projects. This skill provides intelligent assistance for component installation, customization, styling, and composition within React/Next.js applications.

## When to Apply

Use this skill when:
- Installing or managing shadcn/ui components
- Working with component registries and presets
- Customizing component styling and themes
- Debugging component integration issues
- Composing complex UI patterns with shadcn components
- Setting up new projects with shadcn/ui
- Working with components.json configuration

## Core Capabilities

### Component Management
- **Installation**: Add new components to existing projects
- **Search**: Find appropriate components for specific use cases
- **Updates**: Manage component versions and updates
- **Customization**: Modify component styles and behavior
- **Composition**: Combine components into complex UI patterns

### Project Setup
- **Initialization**: Set up new projects with shadcn/ui
- **Presets**: Apply and switch between different preset configurations
- **Configuration**: Manage components.json and related settings
- **Theme Management**: Configure colors, typography, and styling

### Development Support
- **Debugging**: Identify and fix component integration issues
- **Best Practices**: Apply shadcn/ui conventions and patterns
- **Performance**: Optimize component usage and bundle size
- **Accessibility**: Ensure components meet accessibility standards

## Component Categories

### Form Components
- Input, Textarea, Select, Checkbox, Radio Group
- Form, Label, Button, Switch
- Date Picker, Combobox, Multi-select

### Layout Components
- Card, Sheet, Dialog, Drawer
- Tabs, Accordion, Collapsible
- Separator, Aspect Ratio, Scroll Area

### Navigation Components
- Navigation Menu, Breadcrumb, Pagination
- Command, Context Menu, Dropdown Menu
- Menubar, Popover, Tooltip

### Data Display
- Table, Data Table, Badge, Avatar
- Alert, Progress, Skeleton
- Calendar, Chart components

### Feedback Components
- Toast, Alert Dialog, Hover Card
- Sonner (toast notifications)
- Loading states and skeletons

## Usage Patterns

### Installation Commands
```bash
npx shadcn-ui@latest add [component]
npx shadcn-ui@latest init
npx shadcn-ui@latest add --all
```

### Project Initialization
```bash
npx shadcn-ui@latest init --preset [preset-name]
```

### Component Customization
- Modify component source files in `components/ui/`
- Update theme configuration in `tailwind.config.js`
- Customize CSS variables in `globals.css`

## Integration Guidelines

### With Next.js
- App Router compatibility
- Server Component support
- Client Component boundaries
- Styling with Tailwind CSS

### With TypeScript
- Full type safety
- Component prop types
- Event handler types
- Ref forwarding patterns

### With Form Libraries
- React Hook Form integration
- Zod validation schemas
- Form state management
- Error handling patterns

## Troubleshooting

### Common Issues
- Import path resolution
- Tailwind CSS configuration
- Component styling conflicts
- TypeScript type errors
- Theme customization problems

### Performance Optimization
- Tree shaking unused components
- Bundle size analysis
- Lazy loading strategies
- Component memoization

## Best Practices

### Code Organization
- Component composition patterns
- Reusable component creation
- Prop interface design
- File structure conventions

### Styling Guidelines
- CSS custom properties usage
- Theme consistency
- Responsive design patterns
- Dark mode implementation

### Accessibility
- ARIA attributes
- Keyboard navigation
- Screen reader support
- Focus management

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Component Registry](https://ui.shadcn.com/docs/components)
- [Themes and Customization](https://ui.shadcn.com/themes)
- [Examples and Templates](https://ui.shadcn.com/examples)
