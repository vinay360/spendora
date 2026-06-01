import { FloppyDiskIcon, PlusIcon, TagIcon } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getCurrentUser } from "@/lib/auth"
import { createCategory, updateCategory } from "@/server/actions/categories"
import { getCategories } from "@/server/queries/categories"

const colorOptions = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export default async function CategoriesPage() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const categories = await getCategories(user.id)

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <Badge className="w-fit" variant="secondary">
          <TagIcon data-icon="inline-start" />
          Organizer
        </Badge>
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Categories
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Create reusable spending groups, then edit their labels and visual
            markers as your budget changes.
          </p>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create category</CardTitle>
            <CardDescription>
              Add a category that can be assigned to transactions and budgets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCategory}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input
                    id="name"
                    maxLength={48}
                    minLength={2}
                    name="name"
                    placeholder="Groceries"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="icon">Icon label</FieldLabel>
                  <Input
                    id="icon"
                    maxLength={48}
                    name="icon"
                    placeholder="ShoppingCart"
                  />
                  <FieldDescription>
                    Optional short icon name or marker. Defaults to Receipt.
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="color">Color token</FieldLabel>
                  <Input
                    id="color"
                    maxLength={64}
                    name="color"
                    placeholder="var(--chart-1)"
                  />
                  <FieldDescription>
                    Use a theme token like var(--chart-2), or leave blank.
                  </FieldDescription>
                </Field>
                <Button type="submit">
                  <PlusIcon data-icon="inline-start" />
                  Add category
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle>Your categories</CardTitle>
                <CardDescription>
                  Update category names, icons, and colors inline.
                </CardDescription>
              </div>
              <Badge variant="outline">{categories.length} total</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <form
                          action={updateCategory}
                          className="contents"
                          id={`category-${category.id}`}
                        >
                          <input name="id" type="hidden" value={category.id} />
                          <Input
                            aria-label={`${category.name} category name`}
                            defaultValue={category.name}
                            maxLength={48}
                            minLength={2}
                            name="name"
                            required
                          />
                        </form>
                      </TableCell>
                      <TableCell>
                        <Input
                          aria-label={`${category.name} icon label`}
                          defaultValue={category.icon}
                          form={`category-${category.id}`}
                          maxLength={48}
                          name="icon"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="size-3 rounded-full border"
                            style={{ backgroundColor: category.color }}
                          />
                          <Input
                            aria-label={`${category.name} color token`}
                            defaultValue={category.color}
                            form={`category-${category.id}`}
                            list="category-colors"
                            maxLength={64}
                            name="color"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          form={`category-${category.id}`}
                          size="sm"
                          type="submit"
                          variant="outline"
                        >
                          <FloppyDiskIcon data-icon="inline-start" />
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell className="font-medium" colSpan={4}>
                      No categories yet. Create your first category to start
                      organizing expenses.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <datalist id="category-colors">
              {colorOptions.map((color) => (
                <option key={color} value={color} />
              ))}
            </datalist>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
