import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { add } from '@workspace/math/add';

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Hello Turbo Widget</h1>
        <Button size="sm">{add(2, 2)}</Button>
        <Input />
      </div>
    </div>
  );
}
